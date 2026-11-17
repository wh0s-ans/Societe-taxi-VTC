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
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('client'); // 'client', 'chauffeur', 'admin'
            $table->string('telephone')->nullable();
            
            // Attributs spécifiques au Chauffeur (Héritage STI)
            $table->string('permis')->nullable();
            $table->string('vehicule')->nullable();
            $table->string('statut_validation')->default('en_attente'); // 'en_attente', 'valide', 'rejete'
            $table->boolean('disponible')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'role',
                'telephone',
                'permis',
                'vehicule',
                'statut_validation',
                'disponible',
            ]);
        });
    }
};
