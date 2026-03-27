<?php
namespace App\Http\Controllers;

use App\Models\Workspace;
use Illuminate\Http\Request;

class WorkspaceController extends Controller {
    public function index(Request $request) {
        $workspaces = $request->user()->workspaces()->get()->map(function ($ws) use ($request) {
            return [
                'id' => $ws->id,
                'name' => $ws->name,
                'owner_id' => $ws->owner_id,
                'role' => $ws->pivot->role,
                'memberCount' => $ws->members()->count(),
            ];
        });
        return response()->json($workspaces);
    }

    public function store(Request $request) {
        $request->validate(['name' => 'required|string|max:255']);

        $workspace = Workspace::create([
            'name' => $request->name,
            'owner_id' => $request->user()->id,
        ]);

        $workspace->members()->attach($request->user()->id, ['role' => 'owner']);

        return response()->json([
            'id' => $workspace->id,
            'name' => $workspace->name,
            'owner_id' => $workspace->owner_id,
            'memberCount' => 1,
        ], 201);
    }

    public function show(Request $request, $id) {
        $workspace = $this->getWorkspace($request->user(), $id);
        return response()->json([
            'id' => $workspace->id,
            'name' => $workspace->name,
            'owner_id' => $workspace->owner_id,
            'memberCount' => $workspace->members()->count(),
        ]);
    }

    public function update(Request $request, $id) {
        $workspace = $this->getWorkspace($request->user(), $id);
        $this->requireOwner($workspace, $request->user());
        $request->validate(['name' => 'required|string|max:255']);
        $workspace->update(['name' => $request->name]);
        return response()->json(['id' => $workspace->id, 'name' => $workspace->name]);
    }

    public function destroy(Request $request, $id) {
        $workspace = $this->getWorkspace($request->user(), $id);
        $this->requireOwner($workspace, $request->user());
        $workspace->delete();
        return response()->json(['message' => 'Deleted']);
    }

    private function getWorkspace($user, $id) {
        $workspace = Workspace::findOrFail($id);
        if (!$workspace->members()->where('user_id', $user->id)->exists()) {
            abort(403, 'Not a member of this workspace');
        }
        return $workspace;
    }

    private function requireOwner($workspace, $user) {
        if ($workspace->owner_id !== $user->id) {
            abort(403, 'Only the owner can perform this action');
        }
    }
}
