import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useGameLobbySkeleton } from "./GameLobbySkeletonContext";
import "./styles/lobby.css";

interface LobbyLocationState {
  requestedGame?: string;
}

const gameSlots = [
  {
    key: "game-one",
    title: "Chronicles of the Lost Kingdom",
    description: "Explore the village, read clues, and help its people.",
    route: "/learner/games/game-one",
    buttonLabel: "Play Game One",
    thumbnail: "/images/game-one-thumbnail.png",
    thumbnailAlt:
      "A learner follows glowing guide dots through a pixel-art riverside village",
  },
  {
    key: "game-two",
    title: "Game Two",
    description: "Contributor game slot two",
    route: "/learner/games/game-two",
    buttonLabel: "Open Game Two",
    thumbnail: null,
    thumbnailAlt: null,
  },
] as const;

export function GameLobbyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, createProfile } = useGameLobbySkeleton();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const requestedGame = (location.state as LobbyLocationState | null)
    ?.requestedGame;

  const submitUsername = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = username.trim();

    if (!/^[A-Za-z0-9]{3,10}$/.test(normalized)) {
      setError("Use 3 to 10 letters and numbers only.");
      return;
    }

    setError("");
    createProfile(normalized);

    if (requestedGame) {
      navigate(requestedGame, { replace: true });
    }
  };

  return (
    <main
      className="game-lobby"
      aria-label="Game Lobby"
      data-route-focus
      tabIndex={-1}
    >
      <div className="game-lobby__shell">
        <header className="game-lobby__header">
          <div>
            <p className="game-lobby__eyebrow">ReaDirect Games</p>
            <h1>Game Lobby</h1>
            <p>Choose a game and have fun practicing.</p>
          </div>
          <button
            className="game-lobby__back-button"
            type="button"
            onClick={() => navigate("/learner/dashboard")}
          >
            Back to Dashboard
          </button>
        </header>

        {!profile ? (
          <section
            className="game-lobby__username-card"
            aria-labelledby="game-username-title"
          >
            <span className="game-lobby__profile-mark" aria-hidden="true">
              Aa
            </span>
            <div>
              <p className="game-lobby__eyebrow">One quick step</p>
              <h2 id="game-username-title">Create your game username</h2>
              <p>
                This name will be used across the lobby and both game slots.
              </p>
            </div>

            <form onSubmit={submitUsername} noValidate>
              <label htmlFor="game-username">Game username</label>
              <input
                id="game-username"
                name="game-username"
                value={username}
                minLength={3}
                maxLength={10}
                autoComplete="off"
                aria-describedby="game-username-help game-username-error"
                onChange={(event) => setUsername(event.target.value)}
              />
              <span id="game-username-help">
                Use 3 to 10 letters and numbers.
              </span>
              <span
                id="game-username-error"
                className="game-lobby__error"
                aria-live="polite"
              >
                {error}
              </span>
              <button className="game-lobby__primary-button" type="submit">
                Enter the Lobby
              </button>
            </form>
          </section>
        ) : (
          <>
            <section
              className="game-lobby__profile"
              aria-label="Current game profile"
            >
              <span>Your game username</span>
              <strong>{profile.publicHandle}</strong>
            </section>

            <section
              className="game-lobby__games"
              aria-labelledby="available-games-title"
            >
              <div className="game-lobby__section-heading">
                <div>
                  <p className="game-lobby__eyebrow">Pick one</p>
                  <h2 id="available-games-title">Available games</h2>
                </div>
                <span>2 game slots</span>
              </div>

              <div className="game-lobby__game-grid">
                {gameSlots.map((game, index) => (
                  <article className="game-lobby__game-card" key={game.key}>
                    {game.thumbnail ? (
                      <button
                        className="game-lobby__game-preview"
                        type="button"
                        aria-label={`Play ${game.title}`}
                        title={`Play ${game.title}`}
                        onClick={() => navigate(game.route)}
                      >
                        <img
                          src={game.thumbnail}
                          alt={game.thumbnailAlt ?? ""}
                          loading="eager"
                          decoding="async"
                        />
                        <span
                          className="game-lobby__preview-play"
                          aria-hidden="true"
                        >
                          &#9654;
                        </span>
                      </button>
                    ) : null}
                    <span
                      className="game-lobby__game-number"
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>
                    <h3>{game.title}</h3>
                    <p>{game.description}</p>
                    <button
                      className="game-lobby__game-button"
                      type="button"
                      onClick={() => navigate(game.route)}
                    >
                      {game.buttonLabel}
                    </button>
                  </article>
                ))}
              </div>
            </section>

            <section
              className="game-lobby__leaderboard"
              aria-labelledby="learner-leaderboard-title"
            >
              <div>
                <p className="game-lobby__eyebrow">Learners</p>
                <h2 id="learner-leaderboard-title">Top 10</h2>
              </div>
              <p>
                No verified scores yet. This skeleton is ready for game data.
              </p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
