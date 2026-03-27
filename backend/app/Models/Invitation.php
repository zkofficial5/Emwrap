<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Invitation extends Model {
    protected $fillable = [
        'workspace_id', 'email', 'token',
        'accepted_at', 'expires_at'
    ];

    protected $casts = [
        'accepted_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    public function workspace() {
        return $this->belongsTo(Workspace::class);
    }
}
