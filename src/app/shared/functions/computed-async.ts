import {
	computed,
	CreateComputedOptions,
	DestroyRef,
	effect,
	inject,
	Injector,
	signal,
	untracked,
} from '@angular/core';
import { isObservable, Observable, Subject, switchMap } from 'rxjs';
import { isPromise } from 'rxjs/internal/util/isPromise';

export function computedAsync<T>(
	computation: () => Promise<T> | Observable<T> | T | null,
	options?:
		| (CreateComputedOptions<void> & { initialValue?: T; injector?: Injector })
		| undefined
) {
	const destroyRef = inject(DestroyRef);

	const source$ = new Subject<Promise<T> | Observable<T>>();

	const effectRef = effect(
		() => {
			const newSource = computation();
			if (!isObservable(newSource) && !isPromise(newSource)) {
				untracked(() => sourceValue.set(newSource));
				return;
			}
			untracked(() => source$.next(newSource));
		},
		{ injector: options?.injector }
	);

	const sourceValue = signal<T | null>(options?.initialValue ?? null);

	const sourceResult = source$.pipe(switchMap((s$) => s$)).subscribe({
		next: (value) => {
			sourceValue.set(value);
		},
		error: (error) => {
			sourceValue.set(null);
			throw error;
		},
	});

	destroyRef.onDestroy(() => {
		effectRef.destroy();
		sourceResult.unsubscribe();
	});

	return computed(() => sourceValue());
}
