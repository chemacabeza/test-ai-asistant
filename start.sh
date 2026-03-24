#!/usr/bin/env bash
# ============================================
# AI Assistant — Docker Management Script
# Usage:
#   ./start.sh build [offline]   — Build Docker images
#   ./start.sh start [offline]   — Start containers (opens browser)
#   ./start.sh stop              — Stop all containers
#   ./start.sh restart [offline] — Restart containers
#   ./start.sh logs              — Tail container logs
#   ./start.sh status            — Show container status
# ============================================

set -euo pipefail

APP_NAME="ai-assistant"
COMPOSE_FILE="docker-compose.yml"
FRONTEND_PORT=3000
FRONTEND_URL="http://localhost:${FRONTEND_PORT}"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# ---- Helpers ----

print_banner() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════╗"
    echo "║        🎙️  AI Assistant               ║"
    echo "╚══════════════════════════════════════╝"
    echo -e "${NC}"
}

info()    { echo -e "${CYAN}[INFO]${NC}  $1"; }
success() { echo -e "${GREEN}[OK]${NC}    $1"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $1"; }
error()   { echo -e "${RED}[ERROR]${NC} $1"; }

# Determine profile based on argument
get_profile() {
    if [[ "${1:-}" == "offline" ]]; then
        echo "offline"
    else
        echo "online"
    fi
}

# Cross-platform browser open
open_browser() {
    local url="$1"
    if command -v xdg-open &>/dev/null; then
        xdg-open "$url" &>/dev/null &
    elif command -v open &>/dev/null; then
        open "$url"
    elif command -v start &>/dev/null; then
        start "$url"
    else
        warn "Cannot detect browser. Please open manually: ${url}"
    fi
}

check_docker() {
    if ! command -v docker &>/dev/null; then
        error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    if ! docker info &>/dev/null 2>&1; then
        error "Docker daemon is not running. Please start Docker."
        exit 1
    fi
}

check_env() {
    local profile="$1"

    if [[ "$profile" == "offline" ]]; then
        success "Offline mode — no API key required"
        return
    fi

    if [[ -z "${OPENAI_API_KEY:-}" ]]; then
        if [[ -f .env ]]; then
            # shellcheck disable=SC1091
            source .env 2>/dev/null || true
            export OPENAI_API_KEY="${OPENAI_API_KEY:-}"
        fi
    fi

    if [[ -z "${OPENAI_API_KEY:-}" ]]; then
        error "OPENAI_API_KEY is not set."
        echo ""
        echo "  Set it via environment variable:"
        echo "    export OPENAI_API_KEY=sk-your-key-here"
        echo ""
        echo "  Or create a .env file:"
        echo "    echo 'OPENAI_API_KEY=sk-your-key-here' > .env"
        echo ""
        echo "  Or run in offline mode:"
        echo "    ./start.sh start offline"
        echo ""
        exit 1
    fi

    success "OPENAI_API_KEY is set"
}

wait_for_healthy() {
    local max_wait=120
    local waited=0
    local interval=3

    info "Waiting for application to be ready..."

    while [[ $waited -lt $max_wait ]]; do
        if curl -sf "${FRONTEND_URL}" &>/dev/null; then
            echo ""
            success "Application is ready! 🎉"
            return 0
        fi
        printf "."
        sleep $interval
        waited=$((waited + interval))
    done

    echo ""
    warn "Application may not be fully ready yet. Check logs with: ./start.sh logs"
    return 1
}

# ---- Commands ----

do_build() {
    local profile
    profile=$(get_profile "${2:-}")

    print_banner
    check_docker
    check_env "$profile"

    info "Building Docker images (${profile} mode)..."
    docker compose -f "$COMPOSE_FILE" --profile "$profile" build --no-cache
    success "Build complete!"
}

do_start() {
    local profile
    profile=$(get_profile "${2:-}")

    print_banner
    check_docker
    check_env "$profile"

    if [[ "$profile" == "offline" ]]; then
        info "Starting ${APP_NAME} in OFFLINE mode (no internet required)..."
    else
        info "Starting ${APP_NAME} in ONLINE mode..."
    fi

    docker compose -f "$COMPOSE_FILE" --profile "$profile" up -d --build

    if wait_for_healthy; then
        info "Opening browser at ${FRONTEND_URL}"
        open_browser "$FRONTEND_URL"
    fi

    echo ""
    echo -e "${BOLD}${GREEN}═══════════════════════════════════════${NC}"
    if [[ "$profile" == "offline" ]]; then
        echo -e "${BOLD}  📴  AI Assistant is running OFFLINE!${NC}"
    else
        echo -e "${BOLD}  ☁️   AI Assistant is running ONLINE!${NC}"
    fi
    echo -e "${BOLD}  📍  Frontend:  ${FRONTEND_URL}${NC}"
    echo -e "${BOLD}  📍  Backend:   http://localhost:8080${NC}"
    echo -e "${BOLD}${GREEN}═══════════════════════════════════════${NC}"
    echo ""
    echo "  Use './start.sh logs' to view logs"
    echo "  Use './start.sh stop' to stop"
    echo ""
}

do_stop() {
    print_banner
    check_docker

    info "Stopping ${APP_NAME}..."
    docker compose -f "$COMPOSE_FILE" --profile online --profile offline down --remove-orphans
    success "All containers stopped."
}

do_restart() {
    do_stop
    echo ""
    do_start "$@"
}

do_logs() {
    check_docker
    docker compose -f "$COMPOSE_FILE" --profile online --profile offline logs -f --tail=100
}

do_status() {
    check_docker
    echo ""
    docker compose -f "$COMPOSE_FILE" --profile online --profile offline ps
    echo ""
}

# ---- Main ----

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

case "${1:-}" in
    build)   do_build "$@"   ;;
    start)   do_start "$@"   ;;
    stop)    do_stop          ;;
    restart) do_restart "$@"  ;;
    logs)    do_logs          ;;
    status)  do_status        ;;
    *)
        echo "Usage: $0 {build|start|stop|restart|logs|status} [offline]"
        echo ""
        echo "  build [offline]    — Build Docker images"
        echo "  start              — Build & start in ONLINE mode (OpenAI, opens browser)"
        echo "  start offline      — Build & start in OFFLINE mode (no internet needed)"
        echo "  stop               — Stop all containers"
        echo "  restart [offline]  — Restart containers"
        echo "  logs               — Tail container logs"
        echo "  status             — Show container status"
        exit 1
        ;;
esac
