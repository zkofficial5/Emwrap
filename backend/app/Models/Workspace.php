<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Workspace extends Model {
    protected $fillable = ['name', 'owner_id'];

    public function owner() {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members() {
        return $this->belongsToMany(User::class, 'workspace_user')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function categories() {
        return $this->hasMany(Category::class);
    }

    public function expenses() {
        return $this->hasMany(Expense::class);
    }

    public function budgets() {
        return $this->hasMany(Budget::class);
    }

    public function invitations() {
        return $this->hasMany(Invitation::class);
    }
}
