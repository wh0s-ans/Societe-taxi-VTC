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
        Schema::create('tarifs', function (Blueprint $table) {
            $table->id();
            $table->string('type_vehicule')->default('Standard'); // ex: Standard, Confort, Van
            $table->decimal('prix_base', 8, 2)->default(10.00);
            $table->decimal('prix_par_km', 8, 2)->default(6.00);
            $table->decimal('supplement_nuit', 8, 2)->default(0.00);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tarifs');
    }
};
