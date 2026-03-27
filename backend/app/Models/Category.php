<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Category extends Model {
    protected $fillable = ['workspace_id', 'name', 'color', 'icon'];

    public function workspace() {
        return $this->belongsTo(Workspace::class);
    }

    public function expenses() {
        return $this->hasMany(Expense::class);
    }

    public function budgets() {
        return $this->hasMany(Budget::class);
    }
}
