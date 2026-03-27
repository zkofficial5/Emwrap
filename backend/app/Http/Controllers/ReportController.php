<?php
namespace App\Http\Controllers;

use App\Models\Workspace;
use App\Models\Expense;
use Illuminate\Http\Request;

class ReportController extends Controller {
    public function summary(Request $request, $workspaceId) {
        $workspace = Workspace::findOrFail($workspaceId);
        $month = $request->month ?? now()->format('Y-m');

        $expenses = Expense::where('workspace_id', $workspaceId)
            ->with('category')
            ->whereRaw("DATE_FORMAT(date, '%Y-%m') = ?", [$month])
            ->get();

        $total = $expenses->sum('amount');
        $byCategory = $expenses->groupBy('category.name')->map(fn($g) => $g->sum('amount'));

        return response()->json([
            'month' => $month,
            'total' => $total,
            'by_category' => $byCategory,
        ]);
    }

    public function export(Request $request, $workspaceId) {
        $workspace = Workspace::findOrFail($workspaceId);
        $month = $request->month ?? now()->format('Y-m');

        $expenses = Expense::with(['category', 'user'])
            ->where('workspace_id', $workspaceId)
            ->whereRaw("DATE_FORMAT(date, '%Y-%m') = ?", [$month])
            ->get();

        $filename = "expenses-{$workspace->name}-{$month}.csv";

        return response()->stream(function () use ($expenses, $request, $workspaceId, $month) {
            $handle = fopen('php://output', 'w');

            if ($request->ai === 'true') {
                try {
                    $aiService = app(\App\Services\OpenAiService::class);
                    $total = $expenses->sum('amount');
                    $prompt = "Write a 2-sentence professional expense summary for {$month}. Total spent: \${$total}.";
                    $summary = $aiService->complete($prompt);
                    fputcsv($handle, ["# AI Summary: {$summary}"]);
                    fputcsv($handle, []);
                } catch (\Exception $e) {}
            }

            fputcsv($handle, ['Date', 'Title', 'Category', 'Amount', 'Logged By']);
            foreach ($expenses as $expense) {
                fputcsv($handle, [
                    $expense->date->format('Y-m-d'),
                    $expense->title,
                    $expense->category->name ?? '',
                    $expense->amount,
                    $expense->user->name ?? '',
                ]);
            }
            fclose($handle);
        }, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
