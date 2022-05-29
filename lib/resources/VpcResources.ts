import * as cdk from 'aws-cdk-lib';
import { aws_ec2 as ec2 } from "aws-cdk-lib";
import { aws_kms as kms } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { aws_s3 as s3 } from 'aws-cdk-lib';

import { Construct } from "constructs";
import { getVpcConfig } from "../config/VpcConfig";
import { VpcConfig } from "../config/VpcConfig";

export class VpcResources {
    public readonly vpc: ec2.Vpc;
    public readonly frontendSubnet1a: ec2.PublicSubnet;
    public readonly frontendSubnet1c: ec2.PublicSubnet;
    public readonly backendSubnet1a: ec2.PublicSubnet;
    public readonly backendSubnet1c: ec2.PublicSubnet;
    public readonly datalinkSubnet1a: ec2.PrivateSubnet;
    public readonly datalinkSubnet1c: ec2.PrivateSubnet;

    constructor(scope: Construct, prefix: String) {
        // ----------------------- 設定値 ------------------------------
        // contextから環境名を取得
        const env: string = scope.node.tryGetContext("env")

        // Configを取得
        const vpcConfig: VpcConfig = getVpcConfig(env)


        // ----------------------- VPC ------------------------------
        // VPCを作成
        this.vpc = new ec2.Vpc(scope, 'Vpc', {
            natGateways: 0,
            maxAzs: 2,
            cidr: `${vpcConfig.networkAddress}.0.0/16`,
            subnetConfiguration: [],  // Subnetは後続で作成
            vpcName: `${prefix}-VPC`
        }
        )

        // インターネットゲートウェイを作成
        const cfnInternetGateway = new ec2.CfnInternetGateway(scope, 'InternetGateway', {
            tags: [{
                key: 'Name',
                value: `${prefix}-IGW`
            }]
        })

        // IGWをVPCにアタッチ
        const gatewayAttachment = new ec2.CfnVPCGatewayAttachment(scope, 'IGW2VPC', {
            vpcId: this.vpc.vpcId,
            internetGatewayId: cfnInternetGateway.ref
        })


        // ----------------------- FrontendSubnet ------------------------------
        // FrontendSubnet（1a）を作成
        this.frontendSubnet1a = new ec2.PublicSubnet(scope, 'FrontendSubnet1a',
            {
                availabilityZone: 'ap-northeast-1a',
                vpcId: this.vpc.vpcId,
                cidrBlock: `${vpcConfig.networkAddress}.0.0/24`,
                mapPublicIpOnLaunch: true
            }
        )
        this.frontendSubnet1a.addDefaultInternetRoute(cfnInternetGateway.ref, gatewayAttachment)
        cdk.Tags.of(this.frontendSubnet1a).add('Name', `${prefix}-frontend-subnet-1a`)

        // FrontendSubnet（1c）を作成
        this.frontendSubnet1c = new ec2.PublicSubnet(scope, 'FrontendSubnet1c',
            {
                availabilityZone: 'ap-northeast-1c',
                vpcId: this.vpc.vpcId,
                cidrBlock: `${vpcConfig.networkAddress}.1.0/24`,
                mapPublicIpOnLaunch: true
            }
        )
        this.frontendSubnet1c.addDefaultInternetRoute(cfnInternetGateway.ref, gatewayAttachment)
        cdk.Tags.of(this.frontendSubnet1c).add('Name', `${prefix}-frontend-subnet-1c`)


        // ----------------------- BackendSubnet ------------------------------
        // BackendSubnet（1a）を作成
        this.backendSubnet1a = new ec2.PublicSubnet(scope, 'BackendSubnet1a',
            {
                availabilityZone: 'ap-northeast-1a',
                vpcId: this.vpc.vpcId,
                cidrBlock: `${vpcConfig.networkAddress}.10.0/24`,
                mapPublicIpOnLaunch: true
            }
        )
        this.backendSubnet1a.addDefaultInternetRoute(cfnInternetGateway.ref, gatewayAttachment)
        cdk.Tags.of(this.backendSubnet1a).add('Name', `${prefix}-backtend-subnet-1a`)

        // BackendSubnet（1c）を作成
        this.backendSubnet1c = new ec2.PublicSubnet(scope, 'BackendSubnet1c',
            {
                availabilityZone: 'ap-northeast-1c',
                vpcId: this.vpc.vpcId,
                cidrBlock: `${vpcConfig.networkAddress}.11.0/24`,
                mapPublicIpOnLaunch: true
            }
        )
        this.backendSubnet1c.addDefaultInternetRoute(cfnInternetGateway.ref, gatewayAttachment)
        cdk.Tags.of(this.backendSubnet1c).add('Name', `${prefix}-backend-subnet-1c`)


        // ----------------------- DatalinkSubnet ------------------------------
        // DatalinkSubnet（1a）を作成
        this.datalinkSubnet1a = new ec2.PrivateSubnet(scope, 'DatalinkSubnet1a',
            {
                availabilityZone: 'ap-northeast-1a',
                vpcId: this.vpc.vpcId,
                cidrBlock: `${vpcConfig.networkAddress}.100.0/24`,
                mapPublicIpOnLaunch: false
            }
        )
        cdk.Tags.of(this.datalinkSubnet1a).add('Name', `${prefix}-datalink-subnet-1a`)

        // DatalinkSubnet（1c）を作成
        this.datalinkSubnet1c = new ec2.PrivateSubnet(scope, 'DatalinkSubnet1c',
            {
                availabilityZone: 'ap-northeast-1c',
                vpcId: this.vpc.vpcId,
                cidrBlock: `${vpcConfig.networkAddress}.101.0/24`,
                mapPublicIpOnLaunch: false
            }
        )
        cdk.Tags.of(this.datalinkSubnet1c).add('Name', `${prefix}-datalink-subnet-1c`)


        // ----------------------- NACL ------------------------------
        const aclTraffic = ec2.AclTraffic.allTraffic();

        const backendNacl = new ec2.NetworkAcl(scope, 'BackendNacl', {
            vpc: this.vpc,
            // the properties below are optional
            networkAclName: 'networkAclName',
            subnetSelection: {
                subnets: [this.backendSubnet1a, this.backendSubnet1c],
            },
        });
        cdk.Tags.of(backendNacl).add('Name', `${prefix}-backend-nacl`)

        // FrontendSubnet -> BackendSubnetのアクセスを許可
        const frontendCidr = ec2.AclCidr.ipv4(`${vpcConfig.networkAddress}.0.0/23`);
        backendNacl.addEntry('IngressFromFrontendSubnet', {
            cidr: frontendCidr,
            ruleNumber: 100,
            traffic: aclTraffic,
            direction: ec2.TrafficDirection.INGRESS,
            networkAclEntryName: `${prefix}-NaclEntry-ingress-from-frontendSubnet`,
            ruleAction: ec2.Action.ALLOW,
        });

        // BackendSubnet <- DatalinkSubnetのアクセスを許可
        const datalinkCidr = ec2.AclCidr.ipv4(`${vpcConfig.networkAddress}.100.0/23`);
        backendNacl.addEntry('IngressFromDatalinkSubnet', {
            cidr: datalinkCidr,
            ruleNumber: 110,
            traffic: aclTraffic,
            direction: ec2.TrafficDirection.INGRESS,
            networkAclEntryName: `${prefix}-NaclEntry-ingress-from-datalinkSubnet`,
            ruleAction: ec2.Action.ALLOW,
        });

        // BackendSubnet -> DefaultCidrの通信を許可
        backendNacl.addEntry('Egress', {
            cidr: ec2.AclCidr.anyIpv4(),
            ruleNumber: 100,
            traffic: aclTraffic,
            direction: ec2.TrafficDirection.EGRESS,
            networkAclEntryName: `${prefix}-NaclEntry-outbound-to-defaultcidr`,
            ruleAction: ec2.Action.ALLOW,
        });

        // ----------------------- VPCフローログ ------------------------------
        // CMK
        const flowLogKey = new kms.Key(scope, 'Key', {
            enableKeyRotation: true,
            description: 'for VPC Flow log',
            alias: `${prefix}for-flowlog`,
        });
        flowLogKey.addToResourcePolicy(
            new iam.PolicyStatement({
                actions: ['kms:Encrypt*', 'kms:Decrypt*', 'kms:ReEncrypt*', 'kms:GenerateDataKey*', 'kms:Describe*'],
                principals: [new iam.ServicePrincipal('delivery.logs.amazonaws.com')],
                resources: ['*'],
            }),
        );

        // Bucket
        const flowLogBucket = new s3.Bucket(scope, 'FlowLogBucket', {
            accessControl: s3.BucketAccessControl.PRIVATE,
            encryptionKey: flowLogKey,
            encryption: s3.BucketEncryption.KMS,
            autoDeleteObjects: vpcConfig.autoDeleteObjects,
            blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: vpcConfig.removalpolicy,
        });

        this.vpc.addFlowLog('FlowLogs', {
            destination: ec2.FlowLogDestination.toS3(flowLogBucket),
            trafficType: ec2.FlowLogTrafficType.ALL,
        });
    };

}