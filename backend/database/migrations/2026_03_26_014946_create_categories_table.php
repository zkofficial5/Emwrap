<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workspace_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('color', 7)->default('#10B981');
            $table->string('icon', 50)->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('categories'); }
};
