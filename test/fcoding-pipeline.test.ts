import * as cdk from 'aws-cdk-lib';
import * as FcodingPipeline from '../lib/fcoding-pipeline-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new FcodingPipeline.FcodingPipelineStack(app, 'MyTestStack');
    // THEN
    const actual = app.synth().getStackArtifact(stack.artifactId).template;
    expect(actual.Resources ?? {}).toEqual({});
});
