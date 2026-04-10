import uvicorn
import logging
import sys

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s"
)

if __name__ == "__main__":
    logging.getLogger("MAIN").info("🌐 AI CEO Platform Starting...")
    try:
        uvicorn.run(
            "api.server:app",
            host="0.0.0.0",
            port=8000,
            reload=False,
            log_level="info"
        )
    except KeyboardInterrupt:
        logging.getLogger("MAIN").info("👋 Shutdown")
        sys.exit(0)
