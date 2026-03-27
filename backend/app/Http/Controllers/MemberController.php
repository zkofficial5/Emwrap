<?php
namespace App\Http\Controllers;

use App\Models\Workspace;
use Illuminate\Http\Request;

class MemberController extends Controller {
    public function index($workspaceId) {
        $workspace = Workspace::findOrFail($workspaceId);
        $members = $workspace->members()->get()->map(fn($m) => [
            'id' => $m->id,
            'name' => $m->name,
            'email' => $m->email,
            'role' => $m->pivot->role,
        ]);
        return response()->json($members);
    }

    public function destroy(Request $request, $workspaceId, $userId) {
        $workspace = Workspace::findOrFail($workspaceId);
        if ($workspace->owner_id !== $request->user()->id) {
            abort(403, 'Only the owner can remove members');
        }
        if ($userId == $workspace->owner_id) {
            abort(422, 'Cannot remove the workspace owner');
        }
        $workspace->members()->detach($userId);
        return response()->json(['message' => 'Member removed']);
    }
}
