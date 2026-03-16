allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

// Redirect ALL build outputs to a path without spaces to fix the Gradle bug
val buildDirWithoutSpaces = file("C:/flutter_builds/user_app")

rootProject.layout.buildDirectory.set(buildDirWithoutSpaces)

subprojects {
    project.layout.buildDirectory.set(buildDirWithoutSpaces.resolve(project.name))
}

subprojects {
    project.evaluationDependsOn(":app")
}

tasks.register<Delete>("clean") {
    delete(rootProject.layout.buildDirectory)
}
