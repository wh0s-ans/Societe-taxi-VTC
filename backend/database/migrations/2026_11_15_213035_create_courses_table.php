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
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            
            // Relations avec Client et Chauffeur (table users)
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('chauffeur_id')->nullable()->constrained('users')->nullOnDelete();
            
            // Relation avec Tarif
            $table->foreignId('tarif_id')->nullable()->constrained('tarifs')->nullOnDelete();

            // Attributs de la Course
            $table->string('depart');
            $table->string('arrivee');
            $table->decimal('distance', 8, 2); // distance en km
            $table->timestamp('date')->useCurrent();
            $table->string('statut')->default('En attente'); // 'En attente', 'Acceptée', 'En cours', 'Terminée', 'Annulée'
            $table->decimal('prix', 8, 2);
            $table->string('type_vehicule')->default('Standard');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
