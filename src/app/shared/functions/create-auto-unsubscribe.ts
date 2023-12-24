import { Observable, Subject, takeUntil } from "rxjs";
import { DestroyRef, inject } from "@angular/core";

export const createAutoUnsubscribe = () => {
	const subject = new Subject<boolean>();
	inject(DestroyRef).onDestroy(() => {
		subject.next(true);
		subject.complete();
	});

	return <T>(observable: Observable<T>) => observable.pipe(takeUntil(subject));
}
