<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Inscription d'un nouvel utilisateur (Client ou Chauffeur)
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:100',
            'username'  => 'required|string|max:50|unique:users,username',
            'email'     => 'required|email|unique:users,email',
            'password'  => 'required|string|min:6',
            'telephone' => 'nullable|string|max:20',
            'role'      => 'required|in:client,chauffeur',
            'permis'    => 'required_if:role,chauffeur|nullable|string|max:50',
            'vehicule'  => 'required_if:role,chauffeur|nullable|string|max:100',
        ]);

        $user = User::create([
            'name'               => $validated['name'],
            'username'           => $validated['username'],
            'email'              => $validated['email'],
            'password'           => $validated['password'],
            'telephone'          => $validated['telephone'] ?? null,
            'role'               => $validated['role'],
            'permis'             => $validated['permis'] ?? null,
            'vehicule'           => $validated['vehicule'] ?? null,
            'statut_validation'  => $validated['role'] === 'chauffeur' ? 'en_attente' : 'valide',
            'disponible'         => false,
        ]);

        $token = $user->createToken('vtc-token')->plainTextToken;

        return response()->json([
            'token'       => $token,
            'utilisateur' => $this->formatUser($user),
        ], 201);
    }

    /**
     * Connexion par username + mot de passe
     */
    public function login(Request $request)
    {
        $request->validate([
            'username' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = User::where('username', $request->username)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'username' => ['Identifiants incorrects.'],
            ]);
        }

        // Révocation des anciens tokens puis création d'un nouveau
        $user->tokens()->delete();
        $token = $user->createToken('vtc-token')->plainTextToken;

        return response()->json([
            'token'       => $token,
            'utilisateur' => $this->formatUser($user),
        ]);
    }

    /**
     * Déconnexion : révocation du token courant
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnecté avec succès.']);
    }

    /**
     * Retourne le profil de l'utilisateur connecté
     */
    public function me(Request $request)
    {
        return response()->json($this->formatUser($request->user()));
    }

    /* Formate l'utilisateur pour la réponse JSON */
    private function formatUser(User $user): array
    {
        return [
            'id'                => $user->id,
            'nom'               => $user->name,
            'username'          => $user->username,
            'email'             => $user->email,
            'telephone'         => $user->telephone,
            'role'              => $user->role,
            'permis'            => $user->permis,
            'vehicule'          => $user->vehicule,
            'statut_validation' => $user->statut_validation,
            'disponible'        => $user->disponible,
        ];
    }
}
