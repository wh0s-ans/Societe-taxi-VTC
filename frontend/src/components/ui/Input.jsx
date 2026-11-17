import { useState } from 'react';

// Composant Input style shadcn/ui avec support optionnel pour afficher/masquer le mot de passe
function Input({ label, id, error, isPassword = false, ...props }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="mb-3 text-start">
      {label && (
        <label htmlFor={id} className="form-label text-dark fw-semibold small mb-1">
          {label}
        </label>
      )}
      <div className="position-relative">
        <input
          id={id}
          type={isPassword ? (showPassword ? 'text' : 'password') : props.type || 'text'}
          className={`form-control py-2 px-3 rounded-3 ${error ? 'border-danger' : 'border-secondary-subtle'}`}
          style={{ fontSize: '0.925rem' }}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-secondary text-decoration-none pe-3"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex="-1"
            aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          >
            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
          </button>
        )}
      </div>
      {error && <div className="text-danger small mt-1" style={{ fontSize: '0.8rem' }}>{error}</div>}
    </div>
  );
}

export default Input;
