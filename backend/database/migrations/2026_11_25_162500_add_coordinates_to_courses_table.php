<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ajoute les coordonnées GPS optionnelles (départ / arrivée) sur la table courses
     */
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->decimal('depart_lat', 10, 7)->nullable()->after('depart');
            $table->decimal('depart_lon', 10, 7)->nullable()->after('depart_lat');
            $table->decimal('arrivee_lat', 10, 7)->nullable()->after('arrivee');
            $table->decimal('arrivee_lon', 10, 7)->nullable()->after('arrivee_lat');
        });
    }

    /**
     * Supprime les colonnes de coordonnées GPS
     */
    public function down(): void
    {
        Schema::table('courses', function (Blueprint $table) {
            $table->dropColumn(['depart_lat', 'depart_lon', 'arrivee_lat', 'arrivee_lon']);
        });
    }
};
