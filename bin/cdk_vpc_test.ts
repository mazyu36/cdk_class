#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { NonDisposableStack } from '../lib/stacks/NonDisposableStack';

const app = new cdk.App();

//TODO アカウント切り替え処理の実装が必要


const systemName = app.node.tryGetContext('systemName');
const envType = app.node.tryGetContext('envType');
const stackNamePrefix = `${systemName}-${envType}-stack-`;

new NonDisposableStack(app, 'NonDisposableStack',{
    stackName: stackNamePrefix+"NonDisposableStack"
})


