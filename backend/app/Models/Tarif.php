<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tarif extends Model
{
    protected $fillable = [
        'type_vehicule',
        'prix_base',
        'prix_par_km',
        'supplement_nuit',
    ];

    /* Calcul du prix estimé pour une distance donnée */
    public function calculerPrix(float $distanceKm): float
    {
        return round($this->prix_base + ($this->prix_par_km * $distanceKm), 2);
    }
}
