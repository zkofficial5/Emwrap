<?php
namespace App\Http\Controllers;

use App\Models\Workspace;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller {
    public function index($workspaceId) {
        $workspace = Workspace::findOrFail($workspaceId);
        return response()->json($workspace->categories()->get());
    }

    public function store(Request $request, $workspaceId) {
        $workspace = Workspace::findOrFail($workspaceId);
        $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'nullable|string|max:7',
            'icon' => 'nullable|string|max:50',
        ]);

        $category = $workspace->categories()->create([
            'name' => $request->name,
            'color' => $request->color ?? '#10B981',
            'icon' => $request->icon,
        ]);

        return response()->json($category, 201);
    }

    public function destroy($workspaceId, $categoryId) {
        $category = Category::where('workspace_id', $workspaceId)->findOrFail($categoryId);
        $category->delete();
        return response()->json(['message' => 'Deleted']);
    }
}
