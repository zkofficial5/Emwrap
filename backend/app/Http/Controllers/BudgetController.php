<?php
namespace App\Http\Controllers;

use App\Models\Workspace;
use App\Models\Budget;
use App\Models\Expense;
use Illuminate\Http\Request;

class BudgetController extends Controller {
    public function index(Request $request, $workspaceId) {
        $workspace = Workspace::findOrFail($workspaceId);
        $month = $request->month ?? now()->format('Y-m');

        $budgets = $workspace->budgets()
            ->with('category')
            ->where('month', $month)
            ->get()
            ->map(function ($budget) use ($workspaceId, $month) {
                $spent = Expense::where('workspace_id', $workspaceId)
                    ->where('category_id', $budget->category_id)
                    ->whereRaw("DATE_FORMAT(date, '%Y-%m') = ?", [$month])
                    ->sum('amount');

                return [
                    'id' => $budget->id,
                    'category' => $budget->category,
                    'monthly_limit' => $budget->monthly_limit,
                    'month' => $budget->month,
                    'spent' => $spent,
                    'percentage_used' => $budget->monthly_limit > 0
                        ? round(($spent / $budget->monthly_limit) * 100, 1)
                        : 0,
                ];
            });

        return response()->json($budgets);
    }

    public function store(Request $request, $workspaceId) {
        $workspace = Workspace::findOrFail($workspaceId);
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'monthly_limit' => 'required|numeric|min:0',
            'month' => 'required|string|size:7',
        ]);

        $budget = $workspace->budgets()->updateOrCreate(
            ['category_id' => $request->category_id, 'month' => $request->month],
            ['monthly_limit' => $request->monthly_limit]
        );

        return response()->json($budget, 201);
    }

    public function update(Request $request, $workspaceId, $budgetId) {
        $budget = Budget::where('workspace_id', $workspaceId)->findOrFail($budgetId);
        $request->validate(['monthly_limit' => 'required|numeric|min:0']);
        $budget->update(['monthly_limit' => $request->monthly_limit]);
        return response()->json($budget);
    }
}
