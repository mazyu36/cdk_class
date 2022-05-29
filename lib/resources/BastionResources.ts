import * as cdk from 'aws-cdk-lib';
import { Construct } from "constructs";
import { aws_ec2 as ec2 } from "aws-cdk-lib";
import { aws_rds as rds } from "aws-cdk-lib";
import { VpcResources } from "./VpcResources";
import { aws_iam as iam } from 'aws-cdk-lib';

export class BastionTest {
    constructor(scope: Construct, prefix: String, vpcResources: VpcResources) {

        const bastionGroup = new ec2.SecurityGroup(
            scope,
            'Bastion to DB Connection',
            {
                vpc: vpcResources.vpc
            }
        );

        bastionGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22));

        const dbConnectionGroup = new ec2.SecurityGroup(
            scope,
            'Proxy to DB Connection',
            {
                vpc: vpcResources.vpc
            }
        );

        dbConnectionGroup.addIngressRule(
            bastionGroup,
            ec2.Port.tcp(5432),
            'allow bastion connection'
        );

        // 踏み台サーバを配置
        const bastion = new ec2.BastionHostLinux(scope, 'BastionHost', {
            vpc: vpcResources.vpc,
            instanceType: ec2.InstanceType.of(
                ec2.InstanceClass.T2,
                ec2.InstanceSize.MICRO
            ),
            securityGroup: bastionGroup,
            subnetSelection: {
                subnets: [vpcResources.frontendSubnet1a],
            }
        })

        // RDSインスタンス作成
        const rdsInstance = new rds.DatabaseInstance(scope, 'DBInstance', {
            engine: rds.DatabaseInstanceEngine.postgres({
                version: rds.PostgresEngineVersion.VER_12_10
            }),
            credentials: {
                username: 'postgres',
                secretName: 'dbSecret'
            },
            vpc: vpcResources.vpc,
            instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.MICRO),
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            deleteAutomatedBackups: false,
            securityGroups: [dbConnectionGroup],
            port: 5432,
            vpcSubnets: {
                subnets: [vpcResources.datalinkSubnet1a, vpcResources.datalinkSubnet1c]
            },
            databaseName: "test"

        }
        )
    };

}