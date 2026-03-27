<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Budget extends Model {
    protected $fillable = ['workspace_id', 'category_id', 'monthly_limit', 'month'];

    public function workspace() {
        return $this->belongsTo(Workspace::class);
    }

    public function category() {
        return $this->belongsTo(Category::class);
    }
}
