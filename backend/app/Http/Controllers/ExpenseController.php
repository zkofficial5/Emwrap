<?php
namespace App\Http\Controllers;

use App\Models\Workspace;
use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller {
    public function index(Request $request, $workspaceId) {
        $workspace = Workspace::findOrFail($workspaceId);
        $query = $workspace->expenses()->with(['category', 'user']);

        if ($request->date_from) $query->whereDate('date', '>=', $request->date_from);
        if ($request->date_to) $query->whereDate('date', '<=', $request->date_to);
        if ($request->category_id) $query->where('category_id', $request->category_id);
        if ($request->user_id) $query->where('user_id', $request->user_id);

        return response()->json($query->latest('date')->get()->map(fn($e) => [
            'id' => $e->id,
            'title' => $e->title,
            'amount' => $e->amount,
            'date' => $e->date->format('Y-m-d'),
            'category' => $e->category,
            'member' => $e->user->name,
            'receipt_url' => $e->receipt_url,
        ]));
    }

    public function store(Request $request, $workspaceId) {
        $workspace = Workspace::findOrFail($workspaceId);
        $request->validate([
            'title' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'date' => 'required|date',
            'category_id' => 'required|exists:categories,id',
        ]);

        $expense = $workspace->expenses()->create([
            'user_id' => $request->user()->id,
            'category_id' => $request->category_id,
            'title' => $request->title,
            'amount' => $request->amount,
            'date' => $request->date,
            'receipt_url' => $request->receipt_url,
        ]);

        return response()->json($expense->load(['category', 'user']), 201);
    }

    public function update(Request $request, $workspaceId, $expenseId) {
        $expense = Expense::where('workspace_id', $workspaceId)->findOrFail($expenseId);
        $request->validate([
            'title' => 'sometimes|string|max:255',
            'amount' => 'sometimes|numeric|min:0',
            'date' => 'sometimes|date',
            'category_id' => 'sometimes|exists:categories,id',
        ]);
        $expense->update($request->only(['title', 'amount', 'date', 'category_id', 'receipt_url']));
        return response()->json($expense->load(['category', 'user']));
    }

    public function destroy($workspaceId, $expenseId) {
        $expense = Expense::where('workspace_id', $workspaceId)->findOrFail($expenseId);
        $expense->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
