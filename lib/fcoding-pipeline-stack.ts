import { aws_s3, SecretValue, Stack, StackProps } from "aws-cdk-lib";
import {
	aws_codepipeline,
	aws_codepipeline_actions,
	aws_codebuild,
} from "aws-cdk-lib";
import {
	CodeBuildAction,
	GitHubSourceAction,
	S3DeployAction,
} from "aws-cdk-lib/lib/aws-codepipeline-actions";
import { Construct } from "constructs";

const token = process.env.TOKEN ? process.env.TOKEN : "hoge";
const owner = process.env.OWNER ? process.env.OWNER : "hoge";
const repo = process.env.REPO ? process.env.REPO : "hoge";
const s3bukect = process.env.S3BUCKET ? process.env.S3BUCKET : "hoge";
export class FcodingPipelineStack extends Stack {
	constructor(scope: Construct, id: string, props?: StackProps) {
		super(scope, id, props);

		//! Artifact
		const sourceArtifact = new aws_codepipeline.Artifact();
		const buildArtifact = new aws_codepipeline.Artifact();

		//! GitHub(Source)
		const oauthToken = SecretValue.plainText(token);

		const sourceAction: GitHubSourceAction =
			new aws_codepipeline_actions.GitHubSourceAction({
				actionName: "GitHub_Source",
				owner,
				repo,
				oauthToken,
				output: sourceArtifact,
				branch: "main",
				trigger: aws_codepipeline_actions.GitHubTrigger.WEBHOOK,
				variablesNamespace: "SourceVariables",
			});

		//! CodeBuild
		const buildProject = new aws_codebuild.PipelineProject(this, "Build", {
			buildSpec: aws_codebuild.BuildSpec.fromSourceFilename(
				"../buildspec/buildspec.yml"
			),
		});

		const buildAction: CodeBuildAction =
			new aws_codepipeline_actions.CodeBuildAction({
				actionName: "Build",
				input: sourceArtifact,
				project: buildProject,
				outputs: [buildArtifact],
			});

		//! S3 Deploy
		const bucket = aws_s3.Bucket.fromBucketName(this, "test0628", s3bukect);

		const deployAction: S3DeployAction =
			new aws_codepipeline_actions.S3DeployAction({
				actionName: "S3Deploy",
				bucket,
				input: buildArtifact,
				extract: true,
			});

		//! CodePipeline
		const pipeline = new aws_codepipeline.Pipeline(this, "Pipeline", {
			pipelineName: "TestPipeline",
			stages: [
				{
					stageName: "Source",
					actions: [sourceAction],
				},
				{
					stageName: "Build",
					actions: [buildAction],
				},
				{
					stageName: "S3Deploy",
					actions: [deployAction],
				},
			],
		});
	}
}
