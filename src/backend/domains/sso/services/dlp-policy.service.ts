export interface DLPPolicy {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    conditions: PolicyCondition[];
    actions: PolicyAction[];
    priority: number;
}

export interface PolicyCondition {
    type: 'user_role' | 'device_trust' | 'location' | 'time' | 'risk_score' | 'mfa_verified';
    operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
    value: any;
}

export interface PolicyAction {
    type: 'allow' | 'deny' | 'require_mfa' | 'require_approval' | 'log' | 'notify';
    parameters?: Record<string, any>;
}

export interface AccessRequest {
    userId: string;
    userRole: string;
    serviceProvider: string;
    resource: string;
    userAgent: string;
    ipAddress: string;
    deviceTrust: 'trusted' | 'untrusted' | 'unknown';
    mfaVerified: boolean;
    timestamp: Date;
}

export interface PolicyDecision {
    decision: 'allow' | 'deny' | 'require_mfa' | 'require_approval';
    reasons: string[];
    appliedPolicies: string[];
    riskScore: number;
    requiresApproval?: boolean;
    additionalActions: PolicyAction[];
}

export class DLPPolicyEngine {
    private policies: DLPPolicy[] = [];

    constructor() {
        this.initializeDefaultPolicies();
    }

    private initializeDefaultPolicies() {
        this.policies = [
            {
                id: 'aws-admin-access',
                name: 'AWS Admin Access Policy',
                description: 'Require MFA for AWS admin role access',
                enabled: true,
                priority: 1,
                conditions: [
                    {
                        type: 'user_role',
                        operator: 'equals',
                        value: 'admin',
                    },
                    {
                        type: 'mfa_verified',
                        operator: 'equals',
                        value: false,
                    },
                ],
                actions: [
                    {
                        type: 'require_mfa',
                        parameters: {},
                    },
                    {
                        type: 'log',
                        parameters: {
                            level: 'warning',
                            message: 'Admin attempted AWS access without MFA',
                        },
                    },
                ],
            },
            {
                id: 'untrusted-device-block',
                name: 'Untrusted Device Block',
                description: 'Block access from untrusted devices',
                enabled: true,
                priority: 2,
                conditions: [
                    {
                        type: 'device_trust',
                        operator: 'equals',
                        value: 'untrusted',
                    },
                ],
                actions: [
                    {
                        type: 'deny',
                        parameters: {
                            reason: 'Access denied from untrusted device',
                        },
                    },
                    {
                        type: 'notify',
                        parameters: {
                            recipients: ['security@company.com'],
                            subject: 'Blocked access from untrusted device',
                        },
                    },
                ],
            },
            {
                id: 'high-risk-approval',
                name: 'High Risk Access Approval',
                description: 'Require approval for high-risk access attempts',
                enabled: true,
                priority: 3,
                conditions: [
                    {
                        type: 'risk_score',
                        operator: 'greater_than',
                        value: 7,
                    },
                ],
                actions: [
                    {
                        type: 'require_approval',
                        parameters: {
                            approvers: ['security@company.com'],
                            timeout: 3600, // 1 hour
                        },
                    },
                ],
            },
            {
                id: 'off-hours-monitoring',
                name: 'Off Hours Access Monitoring',
                description: 'Enhanced monitoring for off-hours access',
                enabled: true,
                priority: 4,
                conditions: [
                    {
                        type: 'time',
                        operator: 'not_in',
                        value: ['09:00-17:00'],
                    },
                ],
                actions: [
                    {
                        type: 'log',
                        parameters: {
                            level: 'info',
                            message: 'Off-hours access detected',
                        },
                    },
                    {
                        type: 'notify',
                        parameters: {
                            recipients: ['security@company.com'],
                            subject: 'Off-hours access alert',
                        },
                    },
                ],
            },
        ];
    }

    async evaluateAccess(request: AccessRequest): Promise<PolicyDecision> {
        const decision: PolicyDecision = {
            decision: 'allow',
            reasons: [],
            appliedPolicies: [],
            riskScore: this.calculateRiskScore(request),
            additionalActions: [],
        };

        // Sort policies by priority
        const sortedPolicies = this.policies
            .filter((p) => p.enabled)
            .sort((a, b) => a.priority - b.priority);

        for (const policy of sortedPolicies) {
            if (this.evaluateConditions(policy.conditions, request)) {
                decision.appliedPolicies.push(policy.name);

                for (const action of policy.actions) {
                    switch (action.type) {
                        case 'deny':
                            decision.decision = 'deny';
                            decision.reasons.push(
                                action.parameters?.reason || `Denied by policy: ${policy.name}`
                            );
                            break;
                        case 'require_mfa':
                            if (decision.decision !== 'deny') {
                                decision.decision = 'require_mfa';
                                decision.reasons.push(`MFA required by policy: ${policy.name}`);
                            }
                            break;
                        case 'require_approval':
                            if (decision.decision !== 'deny') {
                                decision.decision = 'require_approval';
                                decision.requiresApproval = true;
                                decision.reasons.push(
                                    `Approval required by policy: ${policy.name}`
                                );
                            }
                            break;
                        case 'log':
                        case 'notify':
                            decision.additionalActions.push(action);
                            break;
                    }
                }

                // If denied, stop processing further policies
                if (decision.decision === 'deny') {
                    break;
                }
            }
        }

        // Execute additional actions
        await this.executeActions(decision.additionalActions, request);

        return decision;
    }

    private evaluateConditions(conditions: PolicyCondition[], request: AccessRequest): boolean {
        return conditions.every((condition) => {
            const requestValue = this.getRequestValue(condition.type, request);
            return this.evaluateCondition(condition, requestValue);
        });
    }

    private getRequestValue(type: PolicyCondition['type'], request: AccessRequest): any {
        switch (type) {
            case 'user_role':
                return request.userRole;
            case 'device_trust':
                return request.deviceTrust;
            case 'mfa_verified':
                return request.mfaVerified;
            case 'risk_score':
                return this.calculateRiskScore(request);
            case 'location':
                // In a real implementation, you'd get geolocation from IP
                return 'unknown';
            case 'time':
                const hour = request.timestamp.getHours();
                return `${hour.toString().padStart(2, '0')}:${request.timestamp
                    .getMinutes()
                    .toString()
                    .padStart(2, '0')}`;
            default:
                return null;
        }
    }

    private evaluateCondition(condition: PolicyCondition, value: any): boolean {
        switch (condition.operator) {
            case 'equals':
                return value === condition.value;
            case 'not_equals':
                return value !== condition.value;
            case 'contains':
                return String(value).includes(String(condition.value));
            case 'greater_than':
                return Number(value) > Number(condition.value);
            case 'less_than':
                return Number(value) < Number(condition.value);
            case 'in':
                return Array.isArray(condition.value) && condition.value.includes(value);
            case 'not_in':
                if (condition.type === 'time' && Array.isArray(condition.value)) {
                    // Special handling for time ranges
                    return !condition.value.some((range) => {
                        const [start, end] = range.split('-');
                        const currentTime = value;
                        return currentTime >= start && currentTime <= end;
                    });
                }
                return Array.isArray(condition.value) && !condition.value.includes(value);
            default:
                return false;
        }
    }

    private calculateRiskScore(request: AccessRequest): number {
        let score = 0;

        // Base risk factors
        if (request.deviceTrust === 'untrusted') score += 4;
        if (request.deviceTrust === 'unknown') score += 2;
        if (!request.mfaVerified) score += 3;
        if (request.userRole === 'admin') score += 2;

        // Time-based risk
        const hour = request.timestamp.getHours();
        if (hour < 6 || hour > 22) score += 2; // Off hours

        // Weekend access
        const day = request.timestamp.getDay();
        if (day === 0 || day === 6) score += 1; // Weekend

        // Service provider risk
        if (request.serviceProvider === 'aws') score += 1; // High-value target

        return Math.min(score, 10); // Cap at 10
    }

    private async executeActions(actions: PolicyAction[], request: AccessRequest): Promise<void> {
        for (const action of actions) {
            switch (action.type) {
                case 'log':
                    console.log(`DLP Policy Log [${action.parameters?.level}]:`, {
                        message: action.parameters?.message,
                        request,
                        timestamp: new Date().toISOString(),
                    });
                    break;
                case 'notify':
                    // In a real implementation, send notifications
                    console.log('DLP Policy Notification:', {
                        recipients: action.parameters?.recipients,
                        subject: action.parameters?.subject,
                        request,
                        timestamp: new Date().toISOString(),
                    });
                    break;
                default:
                    break;
            }
        }
    }

    // Policy management methods
    addPolicy(policy: DLPPolicy): void {
        this.policies.push(policy);
    }

    updatePolicy(id: string, updates: Partial<DLPPolicy>): boolean {
        const index = this.policies.findIndex((p) => p.id === id);
        if (index !== -1) {
            this.policies[index] = { ...this.policies[index], ...updates };
            return true;
        }
        return false;
    }

    deletePolicy(id: string): boolean {
        const index = this.policies.findIndex((p) => p.id === id);
        if (index !== -1) {
            this.policies.splice(index, 1);
            return true;
        }
        return false;
    }

    getPolicies(): DLPPolicy[] {
        return this.policies;
    }

    getPolicy(id: string): DLPPolicy | undefined {
        return this.policies.find((p) => p.id === id);
    }
}
