use axum::{
    response::Html,
    routing::get,
    Router,
};
use std::env;
use std::path::PathBuf;
use tower_http::services::ServeDir;
use tower::ServiceBuilder;
use tower_http::trace::TraceLayer;

fn get_dist_path() -> PathBuf {
    // In Shuttle runtime, assets declared in [build].assets are copied to /build_assets/
    // The Docker build does: COPY --from=builder /build_assets /app
    // This copies the CONTENTS of /build_assets to /app, so dist/ becomes /app/dist/
    // Check if we're running on Shuttle (SHUTTLE env var is set)
    if env::var("SHUTTLE").is_ok() {
        // Production: Docker copies /build_assets/dist/* to /app/dist/*
        // Try /app/dist first (where Docker copies to), then /build_assets/dist (original location)
        PathBuf::from("/app/dist")
    } else {
        // Local development: assets are relative to current working directory
        // Get current directory and resolve dist path
        match env::current_dir() {
            Ok(cwd) => cwd.join("dist"),
            Err(_) => PathBuf::from("dist"), // Fallback to relative path
        }
    }
}

async fn serve_index() -> Html<String> {
    let dist_dir = get_dist_path();
    let index_path = dist_dir.join("index.html");
    
    match tokio::fs::read_to_string(&index_path).await {
        Ok(content) => Html(content),
        Err(e) => {
            eprintln!("Failed to read index.html from {:?}: {}", index_path, e);
            Html(format!("<h1>Error: index.html not found at {:?}</h1>", index_path))
        },
    }
}

#[shuttle_runtime::main]
async fn main() -> shuttle_axum::ShuttleAxum {
    // Serve static files from dist - resolve path reliably
    let static_dir = get_dist_path();
    
    let assets_dir = static_dir.join("assets");
    
    // Log the paths being used for debugging
    eprintln!("Serving static files from: {:?}", static_dir);
    eprintln!("Serving assets from: {:?}", assets_dir);
    
    // Create router with static file serving and SPA fallback
    let router = Router::new()
        // Serve static assets (JS, CSS, fonts, etc.) from /assets
        .nest_service(
            "/assets",
            ServeDir::new(assets_dir),
        )
        // Serve index.html for all other routes (SPA routing)
        .fallback(get(serve_index))
        .layer(ServiceBuilder::new().layer(TraceLayer::new_for_http()));

    Ok(router.into())
}
