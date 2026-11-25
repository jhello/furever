plugins {
    id("com.android.application")
}

android {
    namespace = "com.furever.app"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.furever.app"
        minSdk = 26
        targetSdk = 36
        versionCode = 2
        versionName = "0.2.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = false
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

// The Android app reuses the same web UI as the HTML5 version.
// Generate assets at build time so web/ remains the single source of truth.
val webSource = rootProject.file("../web")
val generatedAssets = layout.buildDirectory.dir("generated/fureverAssets")
val fureverServer = providers.gradleProperty("fureverServer").orElse("http://127.0.0.1:3000")

val generateWebAssets by tasks.registering {
    inputs.dir(webSource)
    inputs.property("fureverServer", fureverServer)
    outputs.dir(generatedAssets)

    doLast {
        val target = generatedAssets.get().asFile.resolve("www")
        target.deleteRecursively()
        target.mkdirs()
        webSource.copyRecursively(target, overwrite = true)
        target.resolve("config.js").writeText(
            "window.FUREVER_CONFIG = { defaultServer: \"${fureverServer.get()}\", version: \"0.2.0\" };\n"
        )
    }
}

android.sourceSets.getByName("main").assets.srcDir(generatedAssets)

tasks.named("preBuild") {
    dependsOn(generateWebAssets)
}
