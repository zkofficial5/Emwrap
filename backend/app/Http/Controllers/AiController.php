<?php
namespace App\Http\Controllers;

use App\Models\Workspace;
use App\Models\Expense;
use App\Services\OpenAiService;
use Illuminate\Http\Request;

class AiController extends Controller {
    public function __construct(private OpenAiService $ai) {}

    public function categorize(Request $request) {
        $request->validate(['title' => 'required|string']);

        $categories = ['Food & Dining', 'Transport', 'Software', 'Marketing',
            'Utilities', 'Entertainment', 'Office', 'Travel'];

        $categoryList = implode(', ', $categories);
        $prompt = "Given these expense categories: {$categoryList}. Which single category best fits the expense titled '{$request->title}'? Reply with only the category name, nothing else.";

        $result = $this->ai->complete($prompt);
        $result = trim($result);

        $matched = in_array($result, $categories) ? $result : $categories[0];

        return response()->json(['category' => $matched]);
    }

    public function insights(Request $request) {
        $workspaceId = $request->workspace_id;
        $workspace = Workspace::findOrFail($workspaceId);

        $expenses = Expense::with('category')
            ->where('workspace_id', $workspaceId)
            ->whereRaw("date >= DATE_SUB(NOW(), INTERVAL 2 MONTH)")
            ->get();

        $total = $expenses->sum('amount');
        $byCategory = $expenses->groupBy('category.name')
            ->map(fn($g) => $g->sum('amount'))
            ->sortDesc()
            ->take(4);

        $dataString = "Total spent last 2 months: \${$total}. ";
        foreach ($byCategory as $cat => $amount) {
            $dataString .= "{$cat}: \${$amount}. ";
        }

        $prompt = "Based on this expense data: {$dataString} Give exactly 3 short spending insights as a JSON array of strings. Example: [\"insight 1\", \"insight 2\", \"insight 3\"]. Return only the JSON array, nothing else.";

        try {
            $result = $this->ai->complete($prompt);
            $result = trim($result);
            $result = preg_replace('/```json|```/', '', $result);
            $insights = json_decode($result, true);
            if (!is_array($insights)) $insights = ["Unable to generate insights at this time."];
        } catch (\Exception $e) {
            $insights = ["Unable to generate insights at this time."];
        }

        return response()->json(['insights' => $insights]);
    }

   public function reportSummary(Request $request) {
    $workspaceId = $request->workspace_id;
    $month = $request->month ?? now()->format('Y-m');

    $expenses = Expense::with('category')
        ->where('workspace_id', $workspaceId)
        ->whereRaw("DATE_FORMAT(date, '%Y-%m') = ?", [$month])
        ->get();

    if ($expenses->isEmpty()) {
        return response()->json(['summary' => 'No expenses recorded for this period.']);
    }

    $total = $expenses->sum('amount');
    $topCategory = $expenses->groupBy('category.name')
        ->map(fn($g) => $g->sum('amount'))
        ->sortDesc()->keys()->first() ?? 'Uncategorised';

    $count = $expenses->count();

    $prompt = "You are a financial analyst. Write exactly 3 sentences summarising this team's expenses for {$month}. Total spent: \${$total} across {$count} transactions. Top spending category: {$topCategory}. Be professional and concise. Do not use bullet points or headers.";

    try {
        $summary = $this->ai->complete($prompt);
        $summary = trim($summary);
        if (empty($summary)) {
            $summary = "Total expenditure for {$month} amounted to \${$total} across {$count} transactions, with {$topCategory} representing the highest spend category.";
        }
    } catch (\Exception $e) {
        $summary = "Total expenditure for {$month} amounted to \${$total} across {$count} transactions.";
    }

    return response()->json(['summary' => $summary]);
}
    public function chat(Request $request) {
    $request->validate([
        'message' => 'required|string|max:1000',
        'history' => 'nullable|array',
        'workspace_id' => 'nullable|integer',
    ]);

    $systemPrompt = "You are Emwrap's intelligent financial assistant. You help users understand their spending, offer budgeting advice, and answer any financial questions. Be concise, friendly, and practical. Format responses clearly — use bullet points when listing multiple items.";

    if ($request->workspace_id) {
        try {
            $workspace = \App\Models\Workspace::find($request->workspace_id);
            if ($workspace) {
                $month = now()->format('Y-m');
                $expenses = \App\Models\Expense::with('category')
                    ->where('workspace_id', $request->workspace_id)
                    ->whereRaw("DATE_FORMAT(date, '%Y-%m') = ?", [$month])
                    ->get();

                $budgets = \App\Models\Budget::with('category')
                    ->where('workspace_id', $request->workspace_id)
                    ->where('month', $month)
                    ->get();

                $categories = \App\Models\Category::where('workspace_id', $request->workspace_id)->get();

                $totalSpent = $expenses->sum('amount');
                $byCategory = $expenses->groupBy('category.name')
                    ->map(fn($g) => '$' . number_format($g->sum('amount'), 2))
                    ->toArray();

                $budgetSummary = $budgets->map(fn($b) => "{$b->category->name}: spent \${$b->spent} of \${$b->monthly_limit} limit")->implode(', ');
                $categoriesList = $categories->pluck('name')->implode(', ');

                $systemPrompt .= "\n\nWorkspace context for {$month}:";
                $systemPrompt .= "\n- Workspace: {$workspace->name}";
                $systemPrompt .= "\n- Total spent this month: \${$totalSpent}";
                $systemPrompt .= "\n- Categories: {$categoriesList}";
                $systemPrompt .= "\n- Spending by category: " . json_encode($byCategory);
                $systemPrompt .= "\n- Budget status: " . ($budgetSummary ?: 'No budgets set');
                $systemPrompt .= "\n- Total transactions this month: " . $expenses->count();
            }
        } catch (\Exception $e) {
            // Continue without workspace context
        }
    }

    $messages = [['role' => 'system', 'content' => $systemPrompt]];

    // Append conversation history
    if ($request->history) {
        foreach ($request->history as $msg) {
            if (isset($msg['role'], $msg['content'])) {
                $messages[] = ['role' => $msg['role'], 'content' => $msg['content']];
            }
        }
    }

    $messages[] = ['role' => 'user', 'content' => $request->message];

    try {
        $response = \Illuminate\Support\Facades\Http::withHeaders([
            'Authorization' => 'Bearer ' . config('services.openai.key'),
            'Content-Type' => 'application/json',
        ])->timeout(30)->post('https://api.openai.com/v1/chat/completions', [
            'model' => 'gpt-4o-mini',
            'messages' => $messages,
            'max_tokens' => 600,
        ]);

        $reply = $response->json('choices.0.message.content');

        if (empty($reply)) {
            $reply = "I'm having trouble responding right now. Please try again in a moment.";
        }

        return response()->json(['reply' => trim($reply)]);
    } catch (\Exception $e) {
        return response()->json(['reply' => "I'm unable to respond at the moment. Please check your connection and try again."], 500);
    }
}
}
