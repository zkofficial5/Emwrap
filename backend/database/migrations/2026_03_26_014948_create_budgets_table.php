<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->decimal('monthly_limit', 10, 2);
            $table->string('month', 7);
            $table->timestamps();
            $table->unique(['workspace_id', 'category_id', 'month']);
        });
    }
    public function down(): void { Schema::dropIfExists('budgets'); }
};
