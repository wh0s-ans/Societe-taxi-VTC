<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $fillable = [
        'client_id',
        'chauffeur_id',
        'tarif_id',
        'depart',
        'arrivee',
        'distance',
        'statut',
        'prix',
        'type_vehicule',
    ];

    /* Client ayant commandé la course */
    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    /* Chauffeur assigné à la course */
    public function chauffeur()
    {
        return $this->belongsTo(User::class, 'chauffeur_id');
    }

    /* Tarif appliqué */
    public function tarif()
    {
        return $this->belongsTo(Tarif::class);
    }
}
