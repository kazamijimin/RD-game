import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/game-one.css";
import { createKaplayGame, type KaplayGameController } from "./game/kaplay/createKaplayGame";
import type { Direction } from "./game/input/gameInput";
import { MovementControls } from "./game/input/MovementControls";
import {
  loadMovementControlPreference,
  saveMovementControlPreference,
  type MovementControlMode
} from "./game/input/movementControlPreference";
import {
  createInitialMissionState,
  getMissionTargetNpcId,
  isMissionStageBlocking,
  missionReducer,
  type MissionStage
} from "./game/mission/missionState";
import { clearMissionProgress, loadMissionProgress, saveMissionProgress } from "./game/mission/missionPersistence";
import { getMissions, MISSIONS } from "./game/content/missions";
import { createMissionRounds, createSessionRandom } from "./game/questions/questionRound";
import {
  CompletionOverlay,
  DeferredSavedNotice,
  DeferredQuestionOverlay,
  DeferredResumeOverlay,
  DialogueOverlay,
  HeartRecoveryOverlay,
  HelpOverlay,
  MissionActionOverlay,
  MissionAnnouncements,
  MissionResultOverlay,
  QuestionOverlay,
  QuestionIntroOverlay,
  QuestionsCompletedOverlay,
  ReadingIntroOverlay,
  RemainingQuestionsOverlay,
  StoryPresentationOverlay,
  StoryReviewOverlay
} from "./game/ui/MissionUi";
import { TutorialOverlay } from "./game/tutorial/TutorialOverlay";
import { createInitialTutorialState, saveTutorialProgress, tutorialAllowsMissionEvent, tutorialReducer, type TutorialStep } from "./game/tutorial/tutorialState";
import { consumeProgressResetRequest } from "./game/progress/resetLearnerProgress";
import { NavigationHud, type PlayerNavigationState } from "./game/navigation/NavigationHud";
import { PROTOTYPE_MAP } from "./game/map/prototypeMap";
import { AudioSettingsOverlay } from "./game/audio/AudioSettingsOverlay";
import { createRpgAudioManager, type AudioPreferences } from "./game/audio/rpgAudioManager";
import { getNpc } from "./game/content/npcs";
import { movementHeadsTowardTarget } from "./game/navigation/navigationModel";
import { LanguageSelectionOverlay } from "./game/localization/LanguageSelectionOverlay";
import { getUiCopy, loadLanguagePreference, saveLanguagePreference, type GameLanguage } from "./game/localization/language";
import { FishingOverlay } from "./game/fishing/FishingOverlay";
import { FISHING_SPOTS, getDiscoveredFishingSpotIds, getFishingProximity, type FishingResultId } from "./game/fishing/fishingSystem";
import { RegionBanner } from "./game/world/RegionBanner";
import {
  clearExplorationProgress,
  createInitialExplorationProgress,
  isSafeExplorationPosition,
  loadExplorationProgress,
  saveExplorationProgress
} from "./game/world/explorationPersistence";
import { getWorldRegionAtPoint, type WorldRegionId } from "./game/world/worldRegions";

type GameStatus = "loading" | "ready" | "error";
type PauseReason = "manual" | "document-hidden" | "exit-dialog";

export function GameRoutePage() {
  consumeProgressResetRequest();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<KaplayGameController | null>(null);
  const interactionPromptRef = useRef<HTMLButtonElement | null>(null);
  const interactionPromptPositionRef = useRef<{ x: number; y: number } | null>(null);
  const previousInteractionIdRef = useRef<string | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const [status, setStatus] = useState<GameStatus>("loading");
  const [retryKey, setRetryKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pauseReasons, setPauseReasons] = useState<PauseReason[]>([]);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [audioSettingsOpen, setAudioSettingsOpen] = useState(false);
  const [audioManager] = useState(createRpgAudioManager);
  const [audioPreferences, setAudioPreferences] = useState<AudioPreferences>(() => audioManager.getPreferences());
  const [mapOpen, setMapOpen] = useState(false);
  const [showPath, setShowPath] = useState(true);
  const [storedLanguagePreference] = useState(loadLanguagePreference);
  const preferredLanguage = storedLanguagePreference ?? "en";
  const [languageSelectionOpen, setLanguageSelectionOpen] = useState(() => storedLanguagePreference === null);
  const [languageSelectionRequired, setLanguageSelectionRequired] = useState(() => storedLanguagePreference === null);
  const [draftLanguage, setDraftLanguage] = useState<GameLanguage>(preferredLanguage);
  const [initialExplorationProgress] = useState(loadExplorationProgress);
  const [explorationProgress, setExplorationProgress] = useState(initialExplorationProgress);
  const [fishingSpot, setFishingSpot] = useState<(typeof FISHING_SPOTS)[number] | null>(null);
  const [regionBannerId, setRegionBannerId] = useState<WorldRegionId | null>(initialExplorationProgress.currentRegionId);
  const [playerNavigation, setPlayerNavigation] = useState<PlayerNavigationState>({
    position: { ...initialExplorationProgress.safePosition },
    facing: "down"
  });
  const [movementControlMode, setMovementControlMode] = useState<MovementControlMode>(loadMovementControlPreference);
  const [keyboardDirections, setKeyboardDirections] = useState<ReadonlySet<Direction>>(() => new Set());
  const [random] = useState(createSessionRandom);
  const [initialRounds] = useState(() => createMissionRounds(getMissions(preferredLanguage), random));
  const [preparedMissionState] = useState(() => loadMissionProgress(initialRounds) ?? createInitialMissionState(initialRounds, preferredLanguage));
  const [missionState, dispatchMission] = useReducer(missionReducer, preparedMissionState);
  const copy = getUiCopy(missionState.language);
  const missionTargetNpcId = getMissionTargetNpcId(missionState);
  const missionStateRef = useRef(missionState);
  const showPathRef = useRef(showPath);
  const explorationProgressRef = useRef(explorationProgress);
  const [tutorialState, dispatchTutorial] = useReducer(tutorialReducer, undefined, createInitialTutorialState);
  const guidedDispatchRef = useRef<(event: Parameters<typeof dispatchMission>[0]) => void>(() => undefined);
  const pauseReasonsCountRef = useRef(0);
  const missionOverlayOpenRef = useRef(false);
  missionStateRef.current = missionState;
  showPathRef.current = showPath;
  explorationProgressRef.current = explorationProgress;
  const activePauseReason = pauseReasons[0];
  const isPaused = pauseReasons.length > 0;
  const missionOverlayOpen =
    missionState.activeDialogue !== null ||
    missionState.helpOpen ||
    mapOpen ||
    audioSettingsOpen ||
    languageSelectionOpen ||
    fishingSpot !== null ||
    isMissionStageBlocking(missionState.stage);
  const tutorialAllowsMovement = tutorialState.active &&
    (tutorialState.step === "movement" || tutorialState.step === "interaction") &&
    missionState.stage === "approachStoryCharacter" && !missionState.activeDialogue;
  const inputEnabled = status === "ready" && !isPaused && (!missionOverlayOpen || tutorialAllowsMovement) &&
    (!tutorialState.active || tutorialAllowsMovement) && !languageSelectionOpen;
  const activeFishingSpot = FISHING_SPOTS[0];
  const fishingProximity = getFishingProximity(
    playerNavigation.position,
    playerNavigation.facing,
    activeFishingSpot,
    missionOverlayOpen || isPaused || status !== "ready"
  );
  const fishingReady = fishingProximity === "ready" && missionState.availableInteraction === null;
  const fishingActionLabel = missionState.language === "fil" ? "Mangisda at Magbasa" : "Fish & Read";

  const placeInteractionPrompt = useCallback((position: { x: number; y: number } | null) => {
    interactionPromptPositionRef.current = position;
    const prompt = interactionPromptRef.current;
    if (!prompt || !position) return;
    prompt.style.left = `${clamp(position.x, 0.08, 0.92) * 100}%`;
    const minimumY = window.innerHeight <= 500 ? 0.36 : 0.16;
    prompt.style.top = `${clamp(position.y, minimumY, 0.9) * 100}%`;
  }, []);

  useEffect(() => {
    const reposition = () => placeInteractionPrompt(interactionPromptPositionRef.current);
    reposition();
    window.addEventListener("resize", reposition);
    window.addEventListener("orientationchange", reposition);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("orientationchange", reposition);
    };
  }, [fishingReady, missionState.availableInteraction?.id, placeInteractionPrompt]);

  const dispatchGuided = useCallback((event: Parameters<typeof dispatchMission>[0]) => {
    if (tutorialState.active && tutorialState.skipConfirmationOpen) return;
    if (tutorialState.active && !tutorialAllowsMissionEvent(tutorialState.step, event.type)) return;
    dispatchMission(event);
    if (!tutorialState.active) return;
    if (tutorialState.step === "reading" && event.type === "BEGIN_MISSION_ACTION") {
      dispatchTutorial({ type: "COMPLETE_STEP", step: "reading" });
    } else if (tutorialState.step === "readAgain" && event.type === "CLOSE_STORY_REVIEW") {
      dispatchTutorial({ type: "COMPLETE_STEP", step: "readAgain" });
    } else if (tutorialState.step === "choice" && event.type === "CONTINUE_AFTER_ACTION") {
      dispatchTutorial({ type: "COMPLETE_STEP", step: "choice" });
    } else if (tutorialState.step === "answerLater" && event.type === "CONFIRM_ANSWER_LATER") {
      dispatchTutorial({ type: "COMPLETE_STEP", step: "answerLater" });
    }
  }, [tutorialState]);
  guidedDispatchRef.current = dispatchGuided;

  useEffect(() => {
    if (tutorialState.active && tutorialState.step === "interaction" && missionState.activeDialogue) {
      dispatchTutorial({ type: "COMPLETE_STEP", step: "interaction" });
    }
  }, [missionState.activeDialogue, tutorialState.active, tutorialState.step]);

  const setPauseReason = useCallback((reason: PauseReason, active: boolean) => {
    setPauseReasons((current) => {
      const exists = current.includes(reason);
      if (active && !exists) {
        return [...current, reason];
      }
      if (!active && exists) {
        return current.filter((item) => item !== reason);
      }
      return current;
    });
  }, []);

  useEffect(() => {
    const previousBodyOverflow = document.body.style.overflow;
    const previousBodyTouchAction = document.body.style.touchAction;
    const previousRootOverscroll = document.documentElement.style.overscrollBehavior;
    const previousRootOverflowX = document.documentElement.style.overflowX;

    const keepViewportAtOrigin = () => {
      document.documentElement.scrollLeft = 0;
      document.body.scrollLeft = 0;
    };

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";
    document.documentElement.style.overscrollBehavior = "none";
    document.documentElement.style.overflowX = "hidden";
    keepViewportAtOrigin();
    window.addEventListener("resize", keepViewportAtOrigin);

    return () => {
      window.removeEventListener("resize", keepViewportAtOrigin);
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.touchAction = previousBodyTouchAction;
      document.documentElement.style.overscrollBehavior = previousRootOverscroll;
      document.documentElement.style.overflowX = previousRootOverflowX;
    };
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => {
      setPauseReason("document-hidden", document.visibilityState === "hidden");
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    onVisibilityChange();

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [setPauseReason]);

  useEffect(() => {
    pauseReasonsCountRef.current = pauseReasons.length;
  }, [pauseReasons.length]);

  useEffect(() => {
    missionOverlayOpenRef.current = missionOverlayOpen;
  }, [missionOverlayOpen]);

  useEffect(() => {
    if (isPaused || missionOverlayOpen) {
      controllerRef.current?.pause();
      audioManager.setPaused(isPaused);
      return;
    }

    controllerRef.current?.resume();
    audioManager.setPaused(false);
  }, [audioManager, isPaused, missionOverlayOpen]);

  useEffect(() => {
    audioManager.setMusicRegion(explorationProgress.currentRegionId);
  }, [audioManager, explorationProgress.currentRegionId]);

  useEffect(() => {
    const unlock = () => audioManager.unlock();
    const narrationState = (event: Event) => audioManager.setDucked(Boolean((event as CustomEvent<{ active: boolean }>).detail?.active));
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("readirect:narration-state", narrationState);
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("readirect:narration-state", narrationState);
      audioManager.stop();
    };
  }, [audioManager]);

  useEffect(() => {
    if (!inputEnabled) {
      controllerRef.current?.clearInput();
      setKeyboardDirections(new Set());
    }
  }, [inputEnabled]);

  useEffect(() => {
    saveMissionProgress(missionState);
  }, [missionState]);

  useEffect(() => {
    saveExplorationProgress(explorationProgress);
  }, [explorationProgress]);

  useEffect(() => {
    if (!regionBannerId) return;
    const timer = window.setTimeout(() => setRegionBannerId(null), 1900);
    return () => window.clearTimeout(timer);
  }, [regionBannerId]);

  useEffect(() => {
    const region = getWorldRegionAtPoint(playerNavigation.position);
    const discovered = getDiscoveredFishingSpotIds(playerNavigation.position);
    setExplorationProgress((current) => {
      const newlyDiscovered = discovered.filter((id) => !current.discoveredFishingSpotIds.includes(id));
      const regionChanged = current.currentRegionId !== region.id;
      const safePositionChanged =
        Math.hypot(
          playerNavigation.position.x - current.safePosition.x,
          playerNavigation.position.y - current.safePosition.y
        ) >= 96 &&
        isSafeExplorationPosition(playerNavigation.position);
      if (!regionChanged && newlyDiscovered.length === 0 && !safePositionChanged) return current;
      if (regionChanged) setRegionBannerId(region.id);
      return {
        ...current,
        currentRegionId: region.id,
        safePosition: regionChanged || safePositionChanged ? { ...playerNavigation.position } : current.safePosition,
        discoveredFishingSpotIds: [...current.discoveredFishingSpotIds, ...newlyDiscovered]
      };
    });
  }, [playerNavigation.position]);

  useEffect(() => {
    controllerRef.current?.setFishingInteraction(fishingReady ? activeFishingSpot : null);
  }, [activeFishingSpot, fishingReady]);

  useEffect(() => {
    saveTutorialProgress(tutorialState);
  }, [tutorialState]);

  useEffect(() => {
    if (!tutorialState.active || tutorialState.step !== "movement") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(event.key)) return;
      const direction = keyboardDirection(event.key);
      const target = getNpc(MISSIONS[missionState.missionIndex].npcId).interactionPosition;
      if (movementHeadsTowardTarget(direction, playerNavigation.position, target)) {
        dispatchTutorial({ type: "COMPLETE_STEP", step: "movement" });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [missionState.missionIndex, playerNavigation.position, tutorialState.active, tutorialState.step]);

  useEffect(() => {
    let cancelled = false;

    setStatus("loading");
    setErrorMessage(null);

    Promise.resolve()
      .then(() => {
        if (cancelled || !containerRef.current || controllerRef.current) {
          return;
        }

        controllerRef.current = createKaplayGame(containerRef.current, {
          initialPosition: explorationProgressRef.current.safePosition,
          onInteractionTargetChange: (target) => {
            dispatchMission({ type: "SET_AVAILABLE_INTERACTION", target });
            if (target?.id !== previousInteractionIdRef.current) {
              audioManager.setNearbyTarget(target?.id ?? null);
              if (target) audioManager.interactionAvailable();
              previousInteractionIdRef.current = target?.id ?? null;
            }
          },
          onInteractionPromptPosition: (position) => {
            placeInteractionPrompt(position);
          },
          onPlayerNavigationChange: ({ position, facing }) => {
            setPlayerNavigation({ position, facing });
          },
          onMovementAudioState: ({ moving, terrain, area }) => {
            audioManager.updateLocation(area.key);
            audioManager.updateMovement({ moving, surface: terrain.footstep });
          },
          onKeyboardDirectionChange: (direction, active) => {
            setKeyboardDirections((current) => {
              const next = new Set(current);
              if (active) next.add(direction);
              else next.delete(direction);
              return next;
            });
          },
          onInteract: (target) => {
            guidedDispatchRef.current({ type: "ACTIVATE_INTERACTION", target });
          },
          onFish: (spot) => {
            setFishingSpot(spot);
          }
        });
        const currentMission = missionStateRef.current;
        controllerRef.current.setMissionState({
          activityCompleted: currentMission.activityCompleted,
          targetNpcId: getMissionTargetNpcId(currentMission),
          showPath: showPathRef.current
        });
        if (pauseReasonsCountRef.current > 0 || missionOverlayOpenRef.current) {
          controllerRef.current.pause();
        }
        setStatus("ready");
      })
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "Unknown initialization error";
        console.error("KAPLAY initialization failed", error);
        if (!cancelled) {
          setErrorMessage(message);
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
      controllerRef.current?.destroy();
      controllerRef.current = null;
      window.speechSynthesis?.cancel();
    };
  }, [audioManager, placeInteractionPrompt, retryKey]);

  useEffect(() => {
    controllerRef.current?.setMissionState({
      activityCompleted: missionState.activityCompleted,
      targetNpcId: missionTargetNpcId,
      showPath
    });
  }, [missionState.activityCompleted, missionTargetNpcId, showPath]);

  useEffect(() => {
    audioManager.missionActivated();
    audioManager.guideShown();
  }, [audioManager, missionState.missionIndex]);

  useEffect(() => {
    if (missionState.answerStatus === "correct" || missionState.actionStatus === "correct") audioManager.correct();
    else if (missionState.answerStatus === "incorrect" || missionState.actionStatus === "incorrect") audioManager.incorrect();
  }, [audioManager, missionState.actionStatus, missionState.answerStatus]);

  useEffect(() => {
    if (missionState.stage === "missionCompleted" || missionState.activityCompleted) audioManager.completed();
  }, [audioManager, missionState.activityCompleted, missionState.stage]);

  const pauseTitle = useMemo(() => {
    return activePauseReason === "document-hidden" ? copy.hiddenPaused : copy.paused;
  }, [activePauseReason, copy.hiddenPaused, copy.paused]);

  const retry = () => {
    controllerRef.current?.destroy();
    controllerRef.current = null;
    setRetryKey((value) => value + 1);
  };

  const openExitDialog = () => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setPauseReason("exit-dialog", true);
    setExitDialogOpen(true);
  };

  const closeExitDialog = useCallback(() => {
    setExitDialogOpen(false);
    setPauseReason("exit-dialog", false);
    window.requestAnimationFrame(() => {
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    });
  }, [setPauseReason]);

  const exitToDashboard = () => {
    navigate("/learner/games");
  };

  const replayMission = () => {
    const nextRounds = createMissionRounds(getMissions(missionState.language), random, missionState.rounds);
    controllerRef.current?.clearInput();
    controllerRef.current?.resetMission();
    setPlayerNavigation({ position: { ...PROTOTYPE_MAP.startPosition }, facing: "down" });
    const resetExploration = createInitialExplorationProgress();
    setExplorationProgress(resetExploration);
    explorationProgressRef.current = resetExploration;
    clearExplorationProgress();
    setFishingSpot(null);
    setMapOpen(false);
    setShowPath(true);
    clearMissionProgress();
    dispatchMission({ type: "RESET_ACTIVITY", rounds: nextRounds });
  };

  const openLanguageSelection = () => {
    setDraftLanguage(missionState.language);
    setLanguageSelectionRequired(false);
    setLanguageSelectionOpen(true);
  };

  const confirmLanguage = () => {
    window.speechSynthesis?.cancel();
    window.dispatchEvent(new CustomEvent("readirect:narration-stop"));
    dispatchMission({ type: "SET_LANGUAGE", language: draftLanguage });
    saveLanguagePreference(draftLanguage);
    setLanguageSelectionRequired(false);
    setLanguageSelectionOpen(false);
  };

  useEffect(() => {
    if (!exitDialogOpen) {
      return;
    }

    const dialog = dialogRef.current;
    const focusable = getFocusableElements(dialog);
    focusable[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeExitDialog();
        return;
      }

      if (event.key !== "Tab" || focusable.length === 0) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [closeExitDialog, exitDialogOpen]);

  return (
    <main lang={missionState.language} className="game-route">
      <section
        aria-label={`${copy.gameTitle} ${copy.gameHost}`}
        className="game-route__stage"
      >
        <header className="pointer-events-none absolute inset-x-0 top-0 z-50 flex items-start justify-between gap-4 bg-gradient-to-b from-[#081510]/85 to-transparent px-[max(0.75rem,env(safe-area-inset-left))] py-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#facc15] sm:text-sm">
              {copy.phaseLabel}
            </p>
            <h1 className="text-base font-black drop-shadow sm:text-2xl">
              <span className="game-title-short sm:hidden">{copy.shortTitle}</span>
              <span className="game-title-full hidden sm:inline">{copy.gameTitle}</span>
            </h1>
          </div>
          <div className="pointer-events-auto flex shrink-0 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={openLanguageSelection}
              disabled={tutorialState.active}
              aria-label={`${copy.changeLanguage}: ${missionState.language === "en" ? "English" : "Filipino"}`}
              className="game-language-button min-h-11 rounded-md border-2 border-white bg-[#081510]/65 px-3 font-extrabold text-white shadow"
            >
              <span className="game-language-label-full">{missionState.language === "en" ? "English" : "Filipino"}</span>
              <span className="game-language-label-short" aria-hidden="true">{missionState.language === "en" ? "EN" : "FIL"}</span>
            </button>
            <button
              type="button"
              onClick={() => setAudioSettingsOpen(true)}
              disabled={tutorialState.active}
              className="min-h-11 rounded-md border-2 border-white bg-[#081510]/65 px-3 font-extrabold text-white shadow"
            >
              {copy.sound}
            </button>
            <button
              type="button"
              onClick={() => setPauseReason("manual", true)}
              disabled={status !== "ready" || missionState.activityCompleted || tutorialState.active}
              className="min-h-11 rounded-md bg-white/95 px-3 font-extrabold text-[#13251d] shadow sm:px-4"
            >
              {copy.pause}
            </button>
            <button
              type="button"
              onClick={openExitDialog}
              disabled={tutorialState.active}
              className="min-h-11 rounded-md border-2 border-white bg-[#081510]/45 px-3 font-extrabold text-white shadow sm:px-4"
            >
              {copy.exit}
            </button>
          </div>
        </header>

        <div className="game-route__canvas-layer">
          <div
            ref={containerRef}
            data-testid="game-canvas-container"
            className="game-route__canvas-host"
          />

          {status === "loading" && (
            <StatusOverlay
              title={copy.preparing}
              text={copy.loading}
              role="status"
            />
          )}

          {status === "error" && (
            <StatusOverlay
              title={copy.startError}
              text={copy.startErrorHelp}
              role="alert"
            >
              <p className="sr-only">Technical reason: {errorMessage}</p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={retry}
                  className="min-h-12 rounded-md bg-[#facc15] px-5 font-extrabold text-[#13251d]"
                >
                  {copy.retry}
                </button>
                <button
                  type="button"
                  onClick={exitToDashboard}
                  className="min-h-12 rounded-md bg-white px-5 font-extrabold text-[#13251d]"
                >
                  {copy.exitDashboard}
                </button>
              </div>
            </StatusOverlay>
          )}

          {isPaused && status !== "error" && !exitDialogOpen && (
            <StatusOverlay title={pauseTitle} text={copy.pauseMessage}>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setPauseReason("manual", false)}
                  disabled={activePauseReason !== "manual"}
                  className="min-h-12 rounded-md bg-[#facc15] px-5 font-extrabold text-[#13251d] disabled:cursor-not-allowed disabled:bg-[#9cab9f]"
                >
                  {copy.resume}
                </button>
                <button type="button" onClick={() => {
                  setPauseReason("manual", false);
                  dispatchTutorial({ type: "REOPEN", step: tutorialStepForMissionStage(missionState.stage) });
                }} className="min-h-12 rounded-md bg-[#dcefe5] px-5 font-extrabold text-[#315343]">{copy.showTutorial}</button>
                <button type="button" onClick={openLanguageSelection} className="min-h-12 rounded-md border-2 border-[#176b4d] bg-white px-5 font-extrabold text-[#176b4d]">{copy.changeLanguage}</button>
                <button
                  type="button"
                  onClick={openExitDialog}
                  className="min-h-12 rounded-md bg-white px-5 font-extrabold text-[#13251d]"
                >
                  {copy.exit}
                </button>
              </div>
            </StatusOverlay>
          )}
        </div>

        {status === "ready" && !missionState.activityCompleted && (
          <NavigationHud
            missionState={missionState}
            player={playerNavigation}
            mapOpen={mapOpen}
            showPath={showPath}
            interactionAvailable={Boolean(missionState.availableInteraction)}
            currentRegionId={explorationProgress.currentRegionId}
            discoveredFishingSpotIds={explorationProgress.discoveredFishingSpotIds}
            onOpenMap={() => { setMapOpen(true); audioManager.mapChanged(); }}
            onCloseMap={() => { setMapOpen(false); audioManager.mapChanged(); }}
            onTogglePath={() => setShowPath((value) => !value)}
          />
        )}

        <MissionAnnouncements message={missionState.announcement} />

        {status === "ready" && regionBannerId && !isPaused && <RegionBanner regionId={regionBannerId} language={missionState.language} />}
        <DeferredSavedNotice state={missionState} />

        <MovementControls
          disabled={!inputEnabled}
          language={missionState.language}
          mode={movementControlMode}
          keyboardDirections={keyboardDirections}
          onModeChange={(mode) => {
            controllerRef.current?.clearInput();
            setKeyboardDirections(new Set());
            setMovementControlMode(mode);
            saveMovementControlPreference(mode);
          }}
          onDirectionChange={(direction, active) => {
            controllerRef.current?.setTouchDirection(direction, active);
          }}
          onAnalogVectorChange={(vector) => {
            controllerRef.current?.setAnalogVector(vector);
          }}
          onDirectionalIntent={(vector) => {
            if (tutorialState.active && tutorialState.step === "movement") {
              const target = getNpc(MISSIONS[missionState.missionIndex].npcId).interactionPosition;
              if (movementHeadsTowardTarget(vector, playerNavigation.position, target)) {
                dispatchTutorial({ type: "COMPLETE_STEP", step: "movement" });
              }
            }
          }}
        />

        <div className="mission-actions">
          <button
            type="button"
            onClick={() => dispatchGuided({ type: "REQUEST_HELP" })}
            disabled={status !== "ready" || isPaused || missionOverlayOpen || tutorialState.active}
            className="mission-action-button mission-help-button"
          >
            {copy.help}
          </button>
        </div>
        {(missionState.availableInteraction || fishingReady) && inputEnabled && (
          <button
            ref={interactionPromptRef}
            type="button"
            onClick={() => controllerRef.current?.interact()}
            aria-label={missionState.availableInteraction
              ? (missionState.language === "en" ? missionState.availableInteraction.description : copy.interact)
              : fishingActionLabel}
            className={`mission-interact-button contextual-interact-button ${fishingReady ? "fishing-interact-button" : ""}`}
          >
            <span className="interaction-desktop-label"><kbd>F</kbd><span>{fishingReady ? fishingActionLabel : copy.interact}</span></span>
            <span className="interaction-mobile-label">{fishingReady ? fishingActionLabel : copy.interact}</span>
          </button>
        )}
        {!missionState.availableInteraction && !fishingReady && inputEnabled && ["nearby", "face-water"].includes(fishingProximity) && (
          <div className="fishing-nearby-prompt" data-state={fishingProximity} role="status">
            <span className="fishing-prompt-code" aria-hidden="true">RIV</span>
            <span className="fishing-prompt-copy">
              <strong>
                {fishingProximity === "face-water"
                  ? (missionState.language === "fil" ? "Humarap sa tubig" : "Face the water")
                  : (missionState.language === "fil" ? "May babasahing huli" : "Reading catch nearby")}
              </strong>
              <small>
                {fishingProximity === "face-water"
                  ? (missionState.language === "fil" ? "Mangisda para sa pahiwatig na babasahin" : "Fish for a clue to read")
                  : (missionState.language === "fil" ? "Lumapit sa pampang ng ilog" : "Move closer to the riverbank")}
              </small>
            </span>
          </div>
        )}

        {!isPaused && !exitDialogOpen && (
          <>
            <DialogueOverlay state={missionState} dispatch={dispatchGuided} />
            <ReadingIntroOverlay state={missionState} dispatch={dispatchGuided} />
            <StoryPresentationOverlay state={missionState} dispatch={dispatchGuided} />
            <StoryReviewOverlay state={missionState} dispatch={dispatchGuided} />
            <MissionActionOverlay state={missionState} dispatch={dispatchGuided} />
            <QuestionIntroOverlay state={missionState} dispatch={dispatchGuided} />
            <QuestionOverlay state={missionState} dispatch={dispatchGuided} />
            <HeartRecoveryOverlay state={missionState} dispatch={dispatchGuided} />
            <DeferredQuestionOverlay state={missionState} dispatch={dispatchGuided} />
            <DeferredResumeOverlay state={missionState} dispatch={dispatchGuided} />
            <QuestionsCompletedOverlay state={missionState} dispatch={dispatchGuided} />
            <HelpOverlay
              state={missionState}
              dispatch={dispatchGuided}
              onOpenMap={() => {
                setMapOpen(true);
                audioManager.mapChanged();
              }}
              onShowTutorial={() => {
                dispatchTutorial({
                  type: "REOPEN",
                  step: tutorialStepForMissionStage(missionState.stage)
                });
              }}
            />
            <RemainingQuestionsOverlay state={missionState} dispatch={dispatchGuided} onDashboard={exitToDashboard} />
            <MissionResultOverlay state={missionState} dispatch={dispatchGuided} />
            <CompletionOverlay
              state={missionState}
              onReplay={replayMission}
              onDashboard={exitToDashboard}
            />
          </>
        )}
        {status === "ready" && !isPaused && !exitDialogOpen && !languageSelectionOpen && tutorialState.active && !missionState.activeDialogue && (
          <TutorialOverlay
            state={tutorialState}
            interactionAvailable={Boolean(missionState.availableInteraction)}
            onRequestSkip={() => dispatchTutorial({ type: "REQUEST_SKIP" })}
            onKeepLearning={() => dispatchTutorial({ type: "KEEP_LEARNING" })}
            onSkip={() => dispatchTutorial({ type: "CONFIRM_SKIP" })}
            onFinish={() => dispatchTutorial({ type: "FINISH" })}
            onAdvance={() => dispatchTutorial({ type: "COMPLETE_STEP", step: tutorialState.step })}
            language={missionState.language}
            onChangeLanguage={openLanguageSelection}
          />
        )}
        {audioSettingsOpen && (
          <AudioSettingsOverlay
            preferences={audioPreferences}
            onChange={(preferences) => {
              setAudioPreferences(preferences);
              audioManager.setPreferences(preferences);
            }}
            onClose={() => setAudioSettingsOpen(false)}
            language={missionState.language}
            onChangeLanguage={openLanguageSelection}
          />
        )}
        {languageSelectionOpen && (
          <LanguageSelectionOverlay
            selectedLanguage={draftLanguage}
            required={languageSelectionRequired}
            onSelect={setDraftLanguage}
            onConfirm={confirmLanguage}
            onCancel={() => setLanguageSelectionOpen(false)}
          />
        )}
        {fishingSpot && !isPaused && (
          <FishingOverlay
            language={missionState.language}
            spot={fishingSpot}
            caughtResultIds={explorationProgress.caughtResultIds}
            onCancel={() => setFishingSpot(null)}
            onComplete={(resultId: FishingResultId, attempts) => {
              setExplorationProgress((current) => ({
                ...current,
                completedInteractionIds: current.completedInteractionIds.includes(`fishing:${fishingSpot.id}`)
                  ? current.completedInteractionIds
                  : [...current.completedInteractionIds, `fishing:${fishingSpot.id}`],
                fishingParticipation: current.fishingParticipation + 1,
                fishingAttempts: current.fishingAttempts + attempts,
                caughtResultIds: current.caughtResultIds.includes(resultId)
                  ? current.caughtResultIds
                  : [...current.caughtResultIds, resultId]
              }));
              setFishingSpot(null);
            }}
          />
        )}
      </section>

      {exitDialogOpen && (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-6">
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="exit-title"
            aria-describedby="exit-description"
            className="w-full max-w-md rounded-lg bg-white p-6 text-[#13251d] shadow-2xl"
          >
            <h2 id="exit-title" className="text-2xl font-black">
              {copy.exitTitle}
            </h2>
            <p id="exit-description" className="mt-3 text-lg leading-7 text-[#315343]">
              {copy.exitDescription}
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={closeExitDialog}
                className="min-h-12 rounded-md border-2 border-[#176b4d] px-5 font-extrabold text-[#176b4d]"
              >
                {copy.keepPlaying}
              </button>
              <button
                type="button"
                onClick={exitToDashboard}
                className="min-h-12 rounded-md bg-[#176b4d] px-5 font-extrabold text-white"
              >
                {copy.exitDashboard}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function StatusOverlay({
  title,
  text,
  children,
  role
}: {
  title: string;
  text: string;
  children?: React.ReactNode;
  role?: "alert" | "status";
}) {
  return (
    <div
      role={role}
      aria-live={role === "alert" ? "assertive" : "polite"}
      className="absolute inset-0 z-20 grid place-items-center bg-[#081510]/88 p-6 text-center backdrop-blur-sm"
    >
      <div className="max-w-lg">
        <h2 className="text-3xl font-black">{title}</h2>
        <p className="mt-3 text-lg leading-7 text-[#dcefe5]">{text}</p>
        {children}
      </div>
    </div>
  );
}

function getFocusableElements(root: HTMLElement | null) {
  if (!root) {
    return [];
  }

  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );
}

function tutorialStepForMissionStage(stage: MissionStage): TutorialStep {
  if (stage === "approachStoryCharacter" || stage === "storyIntroduction") return "missionPanel";
  if (stage === "readingIntro" || stage === "storyPresentation" || stage === "storyReview") return "reading";
  if (stage === "missionAction" || stage === "missionActionFeedback") return "readAgain";
  if (["questionIntro", "questionRound", "answerSelected", "questionFeedback", "deferredConfirmation"].includes(stage)) return "answerLater";
  return "ready";
}

function keyboardDirection(key: string) {
  if (key === "ArrowUp" || key === "w") return { x: 0, y: -1 };
  if (key === "ArrowDown" || key === "s") return { x: 0, y: 1 };
  if (key === "ArrowLeft" || key === "a") return { x: -1, y: 0 };
  return { x: 1, y: 0 };
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}
