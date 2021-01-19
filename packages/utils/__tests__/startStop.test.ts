import "mocha";
import { assert, expect } from "chai";
import { StartStopService, Logger } from "../src";
import { verify, spy } from "ts-mockito";

const logger = Logger.getLogger();

class TestStartStop extends StartStopService {
    constructor() {
        super("test-service", logger);
    }
    public async startInternal() {}
    public async stopInternal() {}
}

class ManualStartStop extends StartStopService {
    public resolve: any;
    constructor() {
        super("test-service", logger);
    }
    public async startInternal() {
        await new Promise(resolve => {
            this.resolve = resolve;
        });
    }
    public async stopInternal() {}
}

describe("StartStop", () => {
    it("start can only be called once", async () => {
        const testService = new TestStartStop();
        const spiedService = spy(testService);

        // start twice
        await testService.start();
        try {
            await testService.start();
            assert.fail();
        } catch (err) {
            expect((err as Error).message).to.equal("Already started.");
        }

        await testService.stop();

        //the block event was only subscribed to once
        verify(spiedService.startInternal()).once();
        verify(spiedService.stopInternal()).once();
    });

    it("start cannot be started whilst being started", async () => {
        const testService = new ManualStartStop();
        const spiedService = spy(testService);

        const started = new Promise(resolve => {
            testService.on(StartStopService.STARTED_EVENT, async () => {
                resolve();
            });
        });

        // start twice
        testService.start();
        try {
            await testService.start();
            assert.fail();
        } catch (err) {
            expect((err as Error).message).to.equal("Currently starting.");
        }

        testService.resolve();
        await started;
        await testService.stop();

        //the block event was only subscribed to once
        verify(spiedService.startInternal()).once();
        verify(spiedService.stopInternal()).once();
    });

    it("multiple calls to stop do nothing", async () => {
        const testService = new TestStartStop();
        const spiedService = spy(testService);

        await testService.start();

        // stop twice
        await testService.stop();
        await testService.stop();

        //the block event was only subscribed to once
        verify(spiedService.startInternal()).once();
        verify(spiedService.stopInternal()).once();
    });
});
