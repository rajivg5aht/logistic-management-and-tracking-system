import Link from "next/link";

export default function LoginPage() {
	return (
		<main className="min-h-screen bg-[radial-gradient(circle_at_top,_#e7f0ff,_#f8fafc_45%,_#eef2ff_100%)] px-4 py-10">
			<div className="mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
				<section className="rounded-3xl border border-slate-200/70 bg-white/70 p-8 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.6)] backdrop-blur">
					<div className="mb-8">
						<p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
							CargoNep Platform
						</p>
						<h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
							Welcome back to CargoNep
						</h1>
						<p className="mt-3 text-slate-600">
							Track shipments, coordinate teams, and keep every delivery on time.
						</p>
					</div>

					<form className="space-y-5">
						<div className="space-y-2">
							<label className="text-sm font-medium text-slate-700" htmlFor="email">
								Work Email
							</label>
							<input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								placeholder="you@company.com"
								className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
								required
							/>
						</div>

						<div className="space-y-2">
							<label className="text-sm font-medium text-slate-700" htmlFor="password">
								Password
							</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="current-password"
								placeholder="Enter your password"
								className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
								required
							/>
						</div>

						<div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									name="remember"
									className="h-4 w-4 rounded border-slate-300 text-slate-900"
								/>
								Remember this device
							</label>
							<button type="button" className="font-medium text-slate-700 hover:text-slate-900">
								Forgot password?
							</button>
						</div>

						<button
							type="submit"
							className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800"
						>
							Sign In
						</button>
					</form>

					<p className="mt-6 text-sm text-slate-600">
						Don't have an account?{" "}
						<Link className="font-semibold text-slate-900 hover:underline" href="/register">
							Register
						</Link>
					</p>
				</section>

				<aside className="hidden rounded-3xl border border-slate-200/60 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-8 text-white shadow-[0_25px_80px_-50px_rgba(15,23,42,0.8)] lg:block">
					<div className="flex h-full flex-col justify-between gap-8">
						<div>
							<h2 className="text-2xl font-semibold">Mission control for every route.</h2>
							<p className="mt-4 text-sm text-slate-200">
								FleetPulse blends live tracking, predictive ETAs, and proactive alerts
								so dispatchers see the whole network in one place.
							</p>
						</div>

						<div className="grid gap-4 text-sm">
							<div className="rounded-2xl border border-white/15 bg-white/10 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-200">
									Live Snapshot
								</p>
								<p className="mt-2 text-lg font-semibold">128 Active Loads</p>
								<p className="mt-1 text-slate-200">98% on-time delivery rate</p>
							</div>
							<div className="rounded-2xl border border-white/15 bg-white/10 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-200">Alerts</p>
								<p className="mt-2 text-lg font-semibold">3 Temperature Excursions</p>
								<p className="mt-1 text-slate-200">Resolved before arrival</p>
							</div>
						</div>
					</div>
				</aside>
			</div>
		</main>
	);
}
