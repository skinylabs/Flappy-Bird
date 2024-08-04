"use client";

import { useEffect, useRef, useState } from "react";
import useEventListener from "@use-it/event-listener";
import * as constants from "../../lib/constants";
import EndDialog from "@/components/EndDialog";
import { Circle, Rectangle } from "../types";

// ground
let groundX = 0;

// bird
let birdX = 60;
let birdY = 120;
let birdYSpeed = 0;

// pipes
let pipeGapBottomY = constants.PIPE_HEIGHT;
let pipeX = constants.CANVAS_WIDTH;

// score
let score: number = 0;
let bestScore: number = parseInt(localStorage.getItem("bestScore") || "0");

// check collision between circle and rectangle
const checkCollision = (circle: Circle, rect: Rectangle) => {
  if (
    circle.x + circle.radius >= rect.x &&
    circle.x - circle.radius <= rect.x + rect.width &&
    circle.y + circle.radius >= rect.y &&
    circle.y - circle.radius <= rect.y + rect.height
  ) {
    return true;
  }
  return false;
};

// check if bird has touched a pipe
const touchedPipe = () => {
  const birdHitbox: Circle = {
    x: birdX + constants.BIRD_WIDTH / 2,
    y: birdY + constants.BIRD_HEIGHT / 2 + 5,
    radius: 20,
  };

  const upperPipe: Rectangle = {
    x: pipeX,
    y: 0,
    width: constants.PIPE_WIDTH,
    height: pipeGapBottomY,
  };

  const lowerPipe: Rectangle = {
    x: pipeX,
    y: pipeGapBottomY + constants.PIPE_GAP,
    width: constants.PIPE_WIDTH,
    height:
      constants.CANVAS_HEIGHT -
      constants.HEIGHT_GROUND -
      (pipeGapBottomY + constants.PIPE_GAP),
  };

  return (
    checkCollision(birdHitbox, upperPipe) ||
    checkCollision(birdHitbox, lowerPipe)
  );
};

// check if bird has touched the ground
const fallOut = () =>
  birdY + constants.BIRD_HEIGHT >
  constants.CANVAS_HEIGHT - constants.HEIGHT_GROUND;

// stop game
const reset = () => {
  hasStarted = false;
  hasFinished = true;
};

let hasStarted = false;
let hasFinished = false;
let canGetScore = true;

export default function GamePage() {
  const [showModal, setShowModal] = useState<boolean>(false);
  const canvas = useRef<HTMLCanvasElement>(null);

  // bird jump
  const jump = () => {
    if (hasFinished) {
      return;
    }
    if (!hasStarted) {
      hasStarted = true;
    }
    birdYSpeed = constants.JUMP_SPEED;
  };

  // enable space button
  const handler = (key: any) => {
    if (hasFinished) {
      return;
    }
    if (key.code === "Space") {
      if (!hasStarted) {
        hasStarted = true;
      }
      jump();
    }
  };

  useEventListener("keypress", handler);

  const draw = (context: CanvasRenderingContext2D) => {
    // draw background
    context.fillStyle = "#abfcff";
    context.fillRect(0, 0, constants.CANVAS_WIDTH, constants.CANVAS_HEIGHT);

    // draw clouds
    context.drawImage(
      constants.CLOUDS,
      constants.CLOUDS_X,
      constants.CLOUDS_Y,
      constants.CLOUDS_WIDTH,
      constants.CLOUDS_HEIGHT
    );

    // draw ground
    context.drawImage(
      constants.GROUND,
      groundX,
      constants.GROUND_Y,
      constants.GROUND_WIDTH,
      constants.GROUND_HEIGHT
    );
    context.drawImage(
      constants.GROUND,
      groundX + constants.CANVAS_WIDTH,
      constants.GROUND_Y,
      constants.GROUND_WIDTH,
      constants.GROUND_HEIGHT
    );

    // draw bird
    context.drawImage(
      constants.BIRD,
      birdX,
      birdY,
      constants.BIRD_WIDTH,
      constants.BIRD_HEIGHT
    );

    // draw pipes
    context.fillStyle = "#a6a6a6";
    context.fillRect(pipeX, 0, constants.PIPE_WIDTH, pipeGapBottomY);
    context.fillRect(
      pipeX,
      pipeGapBottomY + constants.PIPE_GAP,
      constants.PIPE_WIDTH,
      constants.CANVAS_HEIGHT -
        constants.HEIGHT_GROUND -
        (pipeGapBottomY + constants.PIPE_GAP)
    );
  };

  useEffect(() => {
    if (canvas.current) {
      const context = canvas.current.getContext("2d");
      if (context) {
        const intervalId = setInterval(() => {
          // dying
          if (touchedPipe() || fallOut()) {
            if (score > bestScore) {
              bestScore = score;
              localStorage.setItem("bestScore", score.toString());
            }
            setShowModal(true);
            reset();
          }

          // check if we should give another score
          if (canGetScore && birdX > pipeX + constants.PIPE_WIDTH) {
            canGetScore = false;
            score++;
          }

          draw(context);

          if (!hasStarted) {
            return;
          }

          // reset pipes
          if (pipeX < -constants.PIPE_WIDTH) {
            pipeX = constants.CANVAS_WIDTH;
            pipeGapBottomY = constants.PIPE_GAP * Math.random();
            canGetScore = true;
          }

          // reset ground
          if (groundX <= -constants.CANVAS_WIDTH) {
            groundX = 0;
          }

          // draw scores
          context.fillStyle = "black";
          context.font = "26px Roboto";
          context.fillText(
            score.toString(),
            constants.CANVAS_WIDTH / 2 - 15,
            50
          );

          // movements
          pipeX -= constants.SPEED;
          groundX -= constants.SPEED;
          birdY += birdYSpeed * (constants.INTERVAL / 1000);
          birdYSpeed -= constants.FALL_SPEED * (constants.INTERVAL / 1000);
        }, constants.INTERVAL);

        return () => clearInterval(intervalId);
      }
    }
  }, []);

  return (
    <div
      className="flex items-center justify-center h-screen w-screen"
      onClick={jump}
      onKeyPress={jump}
    >
      <canvas
        ref={canvas}
        width={constants.CANVAS_WIDTH}
        height={constants.CANVAS_HEIGHT}
        className="w-full h-full  md:w-[20%] md:h-[70%]"
      />
      <EndDialog showDialog={showModal} score={score} bestScore={bestScore} />
    </div>
  );
}
