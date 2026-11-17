<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('evaluations', function (Blueprint $table) {
            $table->id();
            
            // Relation 1:1 ou 1:N avec Course
            $table->foreignId('course_id')->constrained('courses')->onDelete('cascade');
            
            // Attributs de l'Évaluation
            $table->unsignedTinyInteger('note'); // 1 à 5 étoiles
            $table->text('commentaire')->nullable();
            $table->timestamp('date')->useCurrent();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evaluations');
    }
};
