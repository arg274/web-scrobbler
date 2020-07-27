/* eslint-disable @typescript-eslint/ban-ts-comment */

import browserStub from '#/stubs/browser';
import * as webExt from 'webextension-polyfill-ts';

// @ts-ignore
webExt.browser = browserStub;
