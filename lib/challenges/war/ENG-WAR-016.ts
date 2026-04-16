import type { Challenge } from '../types';

// ─── ENG-WAR-016 ─────────────────────────────────────────────────────────────────
// Edit the object below to update this challenge.
// Run `npx next build` after saving to confirm no TypeScript errors.

const challenge: Challenge = {
  id: 'ENG-WAR-016',
    type: 'War Room',
      badgeClass: 'badge-war',
        title: 'Terraform Destroy in the Wrong Workspace',
          companies: ['HashiCorp', 'Shopify'],
            timeEst: '~30 min',
              level: 'Mid',
                status: 'Not Started',
                  realWorldContext: `A famous Spotify incident involved accidentally deleting all of their Kubernetes clusters due to running Terraform in the wrong context. An engineer selecting the wrong Terraform workspace and running terraform destroy has wiped out entire production environments. Spotify recovered with no user impact thanks to GitOps — they simply re-applied their entire infrastructure from code. Teams without IaC have been less fortunate.`,
                    desc: `An engineer accidentally ran terraform destroy in the production workspace instead of staging. The Terraform state shows that your production VPC, all subnets, security groups, RDS cluster, ElastiCache cluster, and 15 EC2 instances have been destroyed. AWS is actively tearing down resources. The application is completely down. You have Terraform state and code in git but no recent snapshots of the database.`,
                      solution: `Stop the destroy if still in progress (Ctrl+C kills the Terraform process; AWS resource deletion continues but may be interrupted). Enable Termination Protection on critical resources in the future. Immediately check for RDS automated backups — AWS keeps them for the retention period even if the instance is deleted. Re-provision infrastructure with terraform apply using the same code. Restore the database from the latest automated snapshot.`,
                        explanation: `Prevention is the real lesson: (1) Enable deletion protection on RDS, ElastiCache, and critical EC2 instances — terraform destroy will fail on protected resources. (2) Use AWS Config rules to alert on resource deletion. (3) Require manual confirmation in CI/CD: terraform plan output must be reviewed before any destroy. (4) Use Terraform Cloud workspaces with required approval steps for production. (5) Store RDS snapshots with lifecycle policies that survive instance deletion.`,
                          options: [
                            { label: 'A', title: 'Roll back Terraform state to previous version and re-run apply', sub: 'git checkout HEAD~1 terraform.tfstate && terraform apply', isCorrect: false },
                            { label: 'B', title: 'Contact AWS Support to reverse all resource deletions', sub: 'Open P1 support case: reverse accidental terraform destroy', isCorrect: false },
                            { label: 'C', title: 'Re-provision infra via terraform apply; restore DB from automated RDS snapshot', sub: 'terraform apply -var-file=prod.tfvars + aws rds restore-db-cluster-from-snapshot', isCorrect: true },
                            { label: 'D', title: 'Promote the staging environment to production immediately', sub: 'Point prod DNS to staging infrastructure', isCorrect: false },
                          ]
};

export default challenge;
