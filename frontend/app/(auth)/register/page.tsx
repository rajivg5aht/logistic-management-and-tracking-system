import Link from "next/link";

export default function RegisterPage() {
	return (
		<main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f1f5ff,_#f8fafc_45%,_#eef2ff_100%)] px-4 py-10">
			<div className="mx-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
				<aside className="hidden rounded-3xl border border-slate-200/60 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-800 p-8 text-white shadow-[0_25px_80px_-50px_rgba(15,23,42,0.8)] lg:block">
					<div className="flex h-full flex-col justify-between gap-8">
						<div>
							<p className="text-xs uppercase tracking-[0.2em] text-slate-300">FleetPulse</p>
							<h2 className="mt-3 text-2xl font-semibold">Create a control tower</h2>
							<p className="mt-4 text-sm text-slate-200">
								Give your logistics team a unified space to monitor routes, manage
								warehouses, and coordinate partners.
							</p>
						</div>

						<div className="grid gap-4 text-sm">
							<div className="rounded-2xl border border-white/15 bg-white/10 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-200">Setup</p>
								<p className="mt-2 text-lg font-semibold">15 min onboarding</p>
								<p className="mt-1 text-slate-200">Import fleets in one step</p>
							</div>
							<div className="rounded-2xl border border-white/15 bg-white/10 p-4">
								<p className="text-xs uppercase tracking-[0.2em] text-slate-200">Security</p>
								<p className="mt-2 text-lg font-semibold">SOC 2 aligned</p>
								<p className="mt-1 text-slate-200">Role-based access control</p>
							</div>
						</div>
					</div>
				</aside>

				<section className="rounded-3xl border border-slate-200/70 bg-white/70 p-8 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.6)] backdrop-blur">
					<div className="mb-8">
						<p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
							Start Tracking
						</p>
						<h1 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
							Register your logistics workspace
						</h1>
						<p className="mt-3 text-slate-600">
							Create a shared hub for dispatch, driver updates, and customer visibility.
						</p>
					</div>

					<form className="space-y-5">
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700" htmlFor="fullName">
									Full Name
								</label>
								<input
									id="fullName"
									name="fullName"
									type="text"
									autoComplete="name"
									placeholder="Jordan Lee"
									className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
									required
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700" htmlFor="company">
									Company
								</label>
								<input
									id="company"
									name="company"
									type="text"
									autoComplete="organization"
									placeholder="Northline Freight"
									className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
									required
								/>
							</div>
						</div>

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

						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700" htmlFor="password">
									Password
								</label>
								<input
									id="password"
									name="password"
									type="password"
									autoComplete="new-password"
									placeholder="Create a password"
									className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
									required
								/>
							</div>
							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700" htmlFor="confirmPassword">
									Confirm Password
								</label>
								<input
									id="confirmPassword"
									name="confirmPassword"
									type="password"
									autoComplete="new-password"
									placeholder="Re-enter password"
									className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
									required
								/>
							</div>
						</div>

						<button
							type="submit"
							className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800"
						>
							Create new Account
						</button>




					</form>

					<p className="mt-6 text-sm text-slate-600">
						Already have an account?{" "}
						<Link className="font-semibold text-slate-900 hover:underline" href="/login">
							SignIn
						</Link>
					</p>
				</section>
			</div>
		</main>
	);
}
