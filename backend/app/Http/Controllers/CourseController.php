<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Tarif;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    /**
     * Liste toutes les courses selon le rôle de l'utilisateur connecté
     * - Client  : ses propres courses
     * - Chauffeur : courses en attente + ses courses assignées
     * - Admin   : toutes les courses
     */
    public function index(Request $request)
    {
        $user = $request->user();

        $query = Course::with(['client:id,name,telephone', 'chauffeur:id,name,vehicule']);

        if ($user->role === 'client') {
            $query->where('client_id', $user->id);
        } elseif ($user->role === 'chauffeur') {
            $query->where(function ($q) use ($user) {
                $q->where('statut', 'En attente')
                  ->orWhere('chauffeur_id', $user->id);
            });
        }
        // admin voit tout

        return response()->json($query->latest()->get());
    }

    /**
     * Création d'une nouvelle course par un client
     */
    public function store(Request $request)
    {
        $request->validate([
            'depart'        => 'required|string|max:200',
            'arrivee'       => 'required|string|max:200',
            'distance'      => 'required|numeric|min:0',
            'prix'          => 'required|numeric|min:0',
            'type_vehicule' => 'required|in:Standard,Moto,Confort,Van',
        ]);

        $course = Course::create([
            'client_id'     => $request->user()->id,
            'depart'        => $request->depart,
            'arrivee'       => $request->arrivee,
            'distance'      => $request->distance,
            'prix'          => $request->prix,
            'type_vehicule' => $request->type_vehicule,
            'statut'        => 'En attente',
        ]);

        return response()->json($course->load(['client:id,name,telephone']), 201);
    }

    /**
     * Détail d'une course
     */
    public function show(Course $course)
    {
        return response()->json($course->load(['client:id,name,telephone', 'chauffeur:id,name,vehicule']));
    }

    /**
     * Modification du prix par le client (négociation inDrive)
     */
    public function update(Request $request, Course $course)
    {
        $request->validate(['prix' => 'required|numeric|min:0']);

        // Seul le client propriétaire peut modifier le prix, et seulement si En attente
        if ($request->user()->id !== $course->client_id || $course->statut !== 'En attente') {
            return response()->json(['message' => 'Modification non autorisée.'], 403);
        }

        $course->update(['prix' => $request->prix]);
        return response()->json($course);
    }

    /**
     * Changement de statut (Acceptée / En cours / Terminée / Annulée)
     */
    public function changerStatut(Request $request, Course $course)
    {
        $request->validate([
            'statut' => 'required|in:Acceptée,En cours,Terminée,Annulée',
        ]);

        $user    = $request->user();
        $statut  = $request->statut;

        /* Règles métier : qui peut faire quoi */
        $autorise = match ($statut) {
            'Acceptée'  => $user->role === 'chauffeur' && $course->statut === 'En attente',
            'En cours'  => $user->role === 'chauffeur' && $course->chauffeur_id === $user->id && $course->statut === 'Acceptée',
            'Terminée'  => $user->role === 'chauffeur' && $course->chauffeur_id === $user->id && $course->statut === 'En cours',
            'Annulée'   => ($user->id === $course->client_id && in_array($course->statut, ['En attente', 'Acceptée']))
                        || ($user->role === 'admin'),
            default     => false,
        };

        if (!$autorise) {
            return response()->json(['message' => 'Action non autorisée pour ce statut.'], 403);
        }

        $data = ['statut' => $statut];

        // Affectation du chauffeur quand il accepte
        if ($statut === 'Acceptée') {
            $data['chauffeur_id'] = $user->id;
        }

        $course->update($data);

        return response()->json($course->load(['client:id,name,telephone', 'chauffeur:id,name,vehicule']));
    }

    /**
     * Annulation / suppression d'une course (admin ou client propriétaire)
     */
    public function destroy(Request $request, Course $course)
    {
        $user = $request->user();

        if ($user->role !== 'admin' && $user->id !== $course->client_id) {
            return response()->json(['message' => 'Non autorisé.'], 403);
        }

        $course->delete();
        return response()->json(['message' => 'Course supprimée.']);
    }

    /**
     * Estimation du prix selon le type de véhicule et la distance (en km)
     * Utilisé par le frontend pour l'ajusteur inDrive
     */
    public function estimerPrix(Request $request)
    {
        $request->validate([
            'distance'      => 'required|numeric|min:0',
            'type_vehicule' => 'required|string',
        ]);

        $tarif = Tarif::where('type_vehicule', $request->type_vehicule)->first();

        if (!$tarif) {
            // Fallback : tarif par défaut si aucun enregistré
            $prix = round(10 + ($request->distance * 6), 2);
        } else {
            $prix = $tarif->calculerPrix($request->distance);
        }

        return response()->json(['prix_estime' => $prix, 'type_vehicule' => $request->type_vehicule]);
    }

    /**
     * Statistiques pour l'admin dashboard
     */
    public function statistiques()
    {
        return response()->json([
            'total'      => Course::count(),
            'en_attente' => Course::where('statut', 'En attente')->count(),
            'en_cours'   => Course::where('statut', 'En cours')->count(),
            'terminees'  => Course::where('statut', 'Terminée')->count(),
            'annulees'   => Course::where('statut', 'Annulée')->count(),
            'ca_total'   => Course::where('statut', 'Terminée')->sum('prix'),
        ]);
    }
}
