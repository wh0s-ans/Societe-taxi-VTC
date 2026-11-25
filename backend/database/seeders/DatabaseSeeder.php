<?php

namespace Database\Seeders;

use App\Models\Tarif;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Peuple la base avec les tarifs de référence et des comptes de test
     */
    public function run(): void
    {
        /* ── Tarifs par type de véhicule ── */
        $tarifs = [
            ['type_vehicule' => 'Standard', 'prix_base' => 10.00, 'prix_par_km' => 5.00, 'supplement_nuit' => 2.00],
            ['type_vehicule' => 'Moto',     'prix_base' =>  8.00, 'prix_par_km' => 3.50, 'supplement_nuit' => 1.00],
            ['type_vehicule' => 'Confort',  'prix_base' => 15.00, 'prix_par_km' => 7.00, 'supplement_nuit' => 3.00],
            ['type_vehicule' => 'Van',      'prix_base' => 20.00, 'prix_par_km' => 9.00, 'supplement_nuit' => 4.00],
        ];

        foreach ($tarifs as $tarif) {
            Tarif::firstOrCreate(['type_vehicule' => $tarif['type_vehicule']], $tarif);
        }

        /* ── Compte client de test ── */
        User::firstOrCreate(
            ['username' => 'client.test'],
            [
                'name'      => 'Client Test',
                'username'  => 'client.test',
                'email'     => 'client@vtcexpress.local',
                'password'  => Hash::make('password'),
                'role'      => 'client',
                'telephone' => '0612345678',
            ]
        );

        /* ── Compte chauffeur de test ── */
        User::firstOrCreate(
            ['username' => 'chauffeur.test'],
            [
                'name'               => 'Karim Tazi',
                'username'           => 'chauffeur.test',
                'email'              => 'chauffeur@vtcexpress.local',
                'password'           => Hash::make('password'),
                'role'               => 'chauffeur',
                'telephone'          => '0698765432',
                'permis'             => 'B-123456',
                'vehicule'           => 'Dacia Logan Blanche · 12345-A-1',
                'statut_validation'  => 'valide',
                'disponible'         => true,
            ]
        );
    }
}
