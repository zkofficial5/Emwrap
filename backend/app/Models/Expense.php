<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Expense extends Model {
    protected $fillable = [
        'workspace_id', 'user_id', 'category_id',
        'title', 'amount', 'date', 'receipt_url'
    ];

    protected $casts = ['date' => 'date'];

    public function workspace() {
        return $this->belongsTo(Workspace::class);
    }

    public function user() {
        return $this->belongsTo(User::class);
    }

    public function category() {
        return $this->belongsTo(Category::class);
    }
}
