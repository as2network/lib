import "mocha";
import { expect, use } from "chai";
import chaiAsPromised from "chai-as-promised"
import { Lock, LockManager } from "../src";
import { wait, fnIt } from "@pisa-research/test-utils";
import { ApplicationError } from "@pisa-research/errors";
use(chaiAsPromised);

describe("Lock", () => {
    it("updates 'locked' correctly", async () => {
        const lock = new Lock();

        await lock.acquire();

        expect(lock.locked, "set locked to true after acquire").to.be.true;

        lock.release();

        expect(lock.locked, "set locked to false after release").to.be.false;
    });

    it("gives the lock to the waiters in the right order", async () => {
        const lock = new Lock();

        const callOrder: number[] = [];
        const p1 = lock.acquire().then(async () => {
            callOrder.push(1);
            await wait(30); // make sure to take some time before releasing
            lock.release();
        });

        const p2 = lock.acquire().then(() => {
            callOrder.push(2);
            lock.release();
        });

        const p3 = lock.acquire().then(() => {
            callOrder.push(3);
            lock.release();
        });

        await Promise.all([p1, p2, p3]);

        expect(callOrder).to.deep.equal([1, 2, 3]);
    });

    it("throws ApplicationError if released when not locked", () => {
        const lock = new Lock();
        expect(() => lock.release()).to.throw(ApplicationError);
    });

    it("throws ApplicationError if released two times but acquired only once", () => {
        const lock = new Lock();
        lock.acquire();
        lock.release();
        expect(() => lock.release()).to.throw(ApplicationError);
    });
});

describe("LockManager", () => {
    it("acquire can acquire a key", () => {
        const lockManager = new LockManager();
        return expect(lockManager.acquire("key")).to.be.fulfilled;
    });

    fnIt<LockManager>(l => l.acquire, "can acquire two different keys", () => {
        const lockManager = new LockManager();
        const p1 = lockManager.acquire("key");
        const p2 = lockManager.acquire("anotherKey");
        return expect(Promise.all([p1, p2])).to.be.fulfilled;
    });

    fnIt<LockManager>(l => l.acquire, "cannot acquire a key again before release", async () => {
        const lockManager = new LockManager();
        await lockManager.acquire("key");
        let secondLockAcquired = false;
        lockManager.acquire("key").then(() => {
            secondLockAcquired = true;
        });
        await wait(30);
        expect(secondLockAcquired).to.be.false;
    });

    fnIt<LockManager>(l => l.release, "throws an ApplicationError if key was not acquired", () => {
        const lockManager = new LockManager();
        expect(() => lockManager.release("key")).to.throw(ApplicationError);
    });

    fnIt<LockManager>(l => l.release, "does release a key", async () => {
        const lockManager = new LockManager();
        await lockManager.acquire("key");
        lockManager.release("key");
        let secondLockAcquired = false;
        lockManager.acquire("key").then(() => {
            secondLockAcquired = true;
        });
        await wait(30);
        expect(secondLockAcquired).to.be.true;
    });

    fnIt<LockManager>(
        l => l.release,
        "throws an ApplicationError if a key is released more times than it is acquired",
        async () => {
            const lockManager = new LockManager();
            lockManager.acquire("key");
            lockManager.acquire("key");
            lockManager.release("key");
            lockManager.release("key");
            expect(() => lockManager.release("key")).to.throw(ApplicationError);
        }
    );

    fnIt<LockManager>(l => l.withLock, "returns the value returned by the passed function", async () => {
        const lockManager = new LockManager();
        const func = async () => 42;
        const res = await lockManager.withLock("key", func);

        expect(res).to.equal(42);
    });

    fnIt<LockManager>(l => l.withLock, "throws the same error if the passed function throws", () => {
        const lockManager = new LockManager();
        const t = new Error("Test error");
        const func = () => {
            throw t;
        };
        return expect(lockManager.withLock("key", func)).to.be.rejectedWith(t);
    });

    fnIt<LockManager>(l => l.withLock, "keeps the lock while the passed function's promise is pending", async () => {
        const lockManager = new LockManager();
        const func = () => new Promise(() => {}); // promise that stays pending forever

        lockManager.withLock("key", func);

        let secondLockAcquired = false;
        lockManager.acquire("key").then(() => {
            secondLockAcquired = true;
        });
        await wait(30);
        expect(secondLockAcquired).to.be.false;
    });

    fnIt<LockManager>(l => l.withLock, "released the lock when done succesfully", async () => {
        const lockManager = new LockManager();
        const func = async () => 42;
        const res = await lockManager.withLock("key", func);

        let secondLockAcquired = false;
        lockManager.acquire("key").then(() => {
            secondLockAcquired = true;
        });
        await wait(30);
        expect(secondLockAcquired).to.be.true;
    });

    fnIt<LockManager>(l => l.withLock, "released the lock when the function throws", async () => {
        const lockManager = new LockManager();
        const func = async () => {
            throw Error("Some error");
        };
        try {
            await lockManager.withLock("key", func);
        } catch {}

        let secondLockAcquired = false;
        lockManager.acquire("key").then(() => {
            secondLockAcquired = true;
        });
        await wait(30);
        expect(secondLockAcquired).to.be.true;
    });
});
