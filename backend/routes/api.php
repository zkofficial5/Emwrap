<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\WorkspaceController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\BudgetController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\InvitationController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\AiController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/invitations/accept', [InvitationController::class, 'accept']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);

    // Workspaces
    Route::get('/workspaces', [WorkspaceController::class, 'index']);
    Route::post('/workspaces', [WorkspaceController::class, 'store']);
    Route::get('/workspaces/{id}', [WorkspaceController::class, 'show']);
    Route::put('/workspaces/{id}', [WorkspaceController::class, 'update']);
    Route::delete('/workspaces/{id}', [WorkspaceController::class, 'destroy']);

    // Members
    Route::get('/workspaces/{id}/members', [MemberController::class, 'index']);
    Route::delete('/workspaces/{id}/members/{userId}', [MemberController::class, 'destroy']);

    // Invitations
    Route::post('/workspaces/{id}/invite', [InvitationController::class, 'invite']);

    // Categories
    Route::get('/workspaces/{id}/categories', [CategoryController::class, 'index']);
    Route::post('/workspaces/{id}/categories', [CategoryController::class, 'store']);
    Route::delete('/workspaces/{id}/categories/{cId}', [CategoryController::class, 'destroy']);

    // Expenses
    Route::get('/workspaces/{id}/expenses', [ExpenseController::class, 'index']);
    Route::post('/workspaces/{id}/expenses', [ExpenseController::class, 'store']);
    Route::put('/workspaces/{id}/expenses/{expId}', [ExpenseController::class, 'update']);
    Route::delete('/workspaces/{id}/expenses/{expId}', [ExpenseController::class, 'destroy']);

    // Budgets
    Route::get('/workspaces/{id}/budgets', [BudgetController::class, 'index']);
    Route::post('/workspaces/{id}/budgets', [BudgetController::class, 'store']);
    Route::put('/workspaces/{id}/budgets/{bId}', [BudgetController::class, 'update']);

    // Reports
    Route::get('/workspaces/{id}/reports/summary', [ReportController::class, 'summary']);
    Route::get('/workspaces/{id}/reports/export', [ReportController::class, 'export']);

    // AI
    Route::post('/ai/categorize', [AiController::class, 'categorize']);
    Route::get('/ai/insights', [AiController::class, 'insights']);
    Route::get('/ai/report-summary', [AiController::class, 'reportSummary']);
    Route::post('/ai/chat', [AiController::class, 'chat']);
});
