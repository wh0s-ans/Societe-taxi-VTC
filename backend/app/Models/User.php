<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'role',
        'telephone',
        'permis',
        'vehicule',
        'statut_validation',
        'disponible',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
        'disponible'        => 'boolean',
    ];

    /* Courses passées en tant que client */
    public function coursesClient()
    {
        return $this->hasMany(Course::class, 'client_id');
    }

    /* Courses assignées en tant que chauffeur */
    public function coursesChauffeur()
    {
        return $this->hasMany(Course::class, 'chauffeur_id');
    }
}
