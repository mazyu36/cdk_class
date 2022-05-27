import { aws_ec2 as ec2, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { getVpcConfig } from "../config/VpcConfig";
import { BaseResource } from "./abstract/BaseResource";


export class Vpc extends BaseResource {
    public readonly vpc: ec2.Vpc;
    public readonly frontendSubnet1a: ec2.PublicSubnet;
    public readonly frontendSubnet1c: ec2.PublicSubnet;
    public readonly backendSubnet1a: ec2.PublicSubnet;
    public readonly backendSubnet1c: ec2.PublicSubnet;
    public readonly datalinkSubnet1a: ec2.PrivateSubnet;
    public readonly datalinkSubnet1c: ec2.PrivateSubnet;

    constructor(scope: Construct) {
        super();

        // contextから環境名を取得
        const env: string = scope.node.tryGetContext("env")

        // Configを取得
        const vpcConfig = getVpcConfig(env) 

        // VPCを作成
        this.vpc = new ec2.Vpc(scope, 'Vpc',
            {
                natGateways: 0,  
                maxAzs: 2,  
                cidr: vpcConfig.networkAddress + '0.0/16',
                subnetConfiguration: []  // デフォルトではAZごとにSubnetが作られてしまうため、明示的に作らないよう指定
            }
        )

        // インターネットゲートウェイを作成
        const cfnInternetGateway = new ec2.CfnInternetGateway(scope, 'InternetGateway', {
            tags: [{
                key: 'Name',
                value: this.createResourceName(scope, 'internet-gateway')
            }]
        })

        // IGWをVPCにアタッチ
        const gatewayAttachment = new ec2.CfnVPCGatewayAttachment(scope, 'IGW2VPC', {
            vpcId: this.vpc.vpcId,
            internetGatewayId: cfnInternetGateway.ref
        })

        // FrontendSubnet（1a）を作成
        const frontendSubnet1a = new ec2.PublicSubnet(scope, 'FrontendSubnet1a',
            {
                availabilityZone: 'ap-northeast-1a',  // AZを指定
                vpcId: this.vpc.vpcId,  // VPCのIDを参照
                cidrBlock: vpcConfig.networkAddress + '0.0/24'
            }
        )
        frontendSubnet1a.addDefaultInternetRoute(cfnInternetGateway.ref, gatewayAttachment)

        // FrontendSubnet（1c）を作成
        const frontendSubnet1c = new ec2.PublicSubnet(scope, 'FrontendSubnet1c',
            {
                availabilityZone: 'ap-northeast-1c',  // AZを指定
                vpcId: this.vpc.vpcId,  // VPCのIDを参照
                cidrBlock: vpcConfig.networkAddress + '1.0/24'
            }
        )
        frontendSubnet1c.addDefaultInternetRoute(cfnInternetGateway.ref, gatewayAttachment)


        // BackendSubnet（1a）を作成
        const backendSubnet1a = new ec2.PublicSubnet(scope, 'BackendSubnet1a',
            {
                availabilityZone: 'ap-northeast-1a',
                vpcId: this.vpc.vpcId,
                cidrBlock: vpcConfig.networkAddress + '10.0/24',
                mapPublicIpOnLaunch: false
            }
        )
        backendSubnet1a.addDefaultInternetRoute(cfnInternetGateway.ref, gatewayAttachment)

        // BackendSubnet（1c）を作成
        const backendSubnet1c = new ec2.PublicSubnet(scope, 'BackendSubnet1c',
            {
                availabilityZone: 'ap-northeast-1c',
                vpcId: this.vpc.vpcId,
                cidrBlock: vpcConfig.networkAddress + '11.0/24',
                mapPublicIpOnLaunch: false
            }
        )
        backendSubnet1c.addDefaultInternetRoute(cfnInternetGateway.ref, gatewayAttachment)

        // DatalinkSubnet（1a）を作成
        const datalinkSubnet1a = new ec2.PrivateSubnet(scope, 'DatalinkSubnet1a',
            {
                availabilityZone: 'ap-northeast-1a',
                vpcId: this.vpc.vpcId,
                cidrBlock: vpcConfig.networkAddress + '100.0/24',
                mapPublicIpOnLaunch: false
            }
        )

        // BackendSubnet（1c）を作成
        const datalinkSubnet1c = new ec2.PrivateSubnet(scope, 'DatalinkSubnet1c',
            {
                availabilityZone: 'ap-northeast-1c',
                vpcId: this.vpc.vpcId,
                cidrBlock: vpcConfig.networkAddress + '101.0/24',
                mapPublicIpOnLaunch: false
            }
        )




        const aclCidr = ec2.AclCidr.ipv4(vpcConfig.networkAddress+"0.0/23");
        const aclTraffic = ec2.AclTraffic.allTraffic();


        const backendNetworkAcl = new ec2.NetworkAcl(scope, 'BackendNetworkAcl', {
            vpc: this.vpc,

            // the properties below are optional
            networkAclName: 'networkAclName',
            subnetSelection: {
                subnets: [backendSubnet1a,backendSubnet1c],
            },
        });

        /*
            Frontend -> Backend
            backend -> DB
            戻り
        */

        const backendNetworkAclEntry = new ec2.NetworkAclEntry(scope, 'BackendNetworkAclEntry', {
            cidr: aclCidr,
            networkAcl: backendNetworkAcl,
            ruleNumber: 123,
            traffic: aclTraffic,

            direction: ec2.TrafficDirection.INGRESS,
            networkAclEntryName: 'networkAclEntryName',
            ruleAction: ec2.Action.ALLOW,
        });


    };

}