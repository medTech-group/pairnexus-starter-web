// The tests' bindings: the Worker's own (worker-configuration.d.ts), plus the migrations to apply.
type WorkerEnv = Env;

declare namespace Cloudflare {
  interface Env extends WorkerEnv {
    TEST_MIGRATIONS: import("cloudflare:test").D1Migration[];
  }
}
