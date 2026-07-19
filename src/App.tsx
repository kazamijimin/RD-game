import { Navigate, Route, Routes, useNavigate } from "react-router-dom";

import {
  GameLobbyPage,
  GameLobbySkeletonProvider,
  RequireSkeletonGameProfile,
} from "@readirect/game-lobby";
import { GameOneRoutePage } from "@readirect/game-one";
import { GameTwoRoutePage } from "@readirect/game-two";

function DashboardReturnPage() {
  const navigate = useNavigate();

  return (
    <main className="starter-dashboard" data-route-focus tabIndex={-1}>
      <section>
        <p>Standalone integration host</p>
        <h1>Learner Dashboard Boundary</h1>
        <span>
          The full learner dashboard belongs to ReaDirect. This placeholder
          verifies the required return route.
        </span>
        <button type="button" onClick={() => navigate("/learner/games")}>
          Open Game Lobby
        </button>
      </section>
    </main>
  );
}

export function App() {
  return (
    <GameLobbySkeletonProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/learner/games" replace />} />
        <Route path="/learner/dashboard" element={<DashboardReturnPage />} />
        <Route path="/learner/games" element={<GameLobbyPage />} />
        <Route
          path="/learner/games/game-one"
          element={
            <RequireSkeletonGameProfile>
              <GameOneRoutePage />
            </RequireSkeletonGameProfile>
          }
        />
        <Route
          path="/learner/games/game-two"
          element={
            <RequireSkeletonGameProfile>
              <GameTwoRoutePage />
            </RequireSkeletonGameProfile>
          }
        />
        <Route path="*" element={<Navigate to="/learner/games" replace />} />
      </Routes>
    </GameLobbySkeletonProvider>
  );
}
