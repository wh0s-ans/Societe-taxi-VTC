<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Routes API — VTC Express
|--------------------------------------------------------------------------
*/

/* ── Auth publique (pas de token requis) ── */
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

/* ── Estimation de prix publique ── */
Route::get('/tarifs/estimer', [CourseController::class, 'estimerPrix']);

/* ── Routes protégées par Sanctum ── */
Route::middleware('auth:sanctum')->group(function () {

    /* Profil & déconnexion */
    Route::get('/me',     [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    /* CRUD Courses */
    Route::get('/courses',                        [CourseController::class, 'index']);
    Route::post('/courses',                       [CourseController::class, 'store']);
    Route::get('/courses/{course}',               [CourseController::class, 'show']);
    Route::patch('/courses/{course}',             [CourseController::class, 'update']);
    Route::patch('/courses/{course}/statut',      [CourseController::class, 'changerStatut']);
    Route::delete('/courses/{course}',            [CourseController::class, 'destroy']);

    /* Statistiques admin */
    Route::get('/statistiques',                   [CourseController::class, 'statistiques']);
});
