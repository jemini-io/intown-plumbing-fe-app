#!/bin/bash

# Booking Notification Task CLI Test Script
# Usage: ./test-cli.sh [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DRY_RUN=false
JOB_TYPE_FILTER="Virtual Consultation"
NODE_ENV="development"
VERBOSE=false

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TASK_DIR="$SCRIPT_DIR"

# Help function
show_help() {
    echo -e "${BLUE}Booking Notification Task CLI${NC}"
    echo ""
    echo "Usage: $0 [options]"
    echo ""
    echo "Options:"
    echo "  -h, --help              Show this help message"
    echo "  -d, --dry-run           Run in dry run mode (default: true)"
    echo "  -p, --production        Run in production mode (sends actual SMS)"
    echo "  -b, --job-type-filter TYPE Set job type filter (default: Virtual Consultation)"
    echo "  -v, --verbose           Enable verbose output"
    echo "  -c, --check-env         Check environment variables"
    echo "  -t, --test              Run quick test with sample data"
    echo ""
    echo "Environment:"
    echo "  Default values are provided for testing. Set environment variables"
    echo "  for production use. Run --check-env to see current status."
    echo ""
    echo "Examples:"
    echo "  $0 --dry-run                    # Test without sending SMS"
    echo "  $0 --production                 # Run in production mode"
    echo "  $0 --job-type-filter 'Video Consultation'  # Test with different job type filter"
    echo "  $0 --check-env                  # Validate environment setup"
    echo ""
}

# Check environment variables
check_environment() {
    echo -e "${BLUE}🔍 Checking environment variables...${NC}"
    echo ""
    
    local using_defaults=()
    local required_vars=(
        "ST_TENANT_ID"
        "ST_CLIENT_ID" 
        "ST_CLIENT_SECRET"
        "ST_BASE_URL"
        "PODIUM_API_KEY"
        "PODIUM_LOCATION_ID"
        "PODIUM_CLIENT_ID"
        "PODIUM_CLIENT_SECRET"
        "PODIUM_REFRESH_TOKEN"
        "PODIUM_REDIRECT_URI"
    )
    
    # Default values for comparison
    local default_values=(
        "12345"
        "test-client-id"
        "test-client-secret"
        "https://api.servicetitan.com"
        "test-api-key"
        "test-location-id"
        "test-client-id"
        "test-client-secret"
        "test-refresh-token"
        "http://localhost:3000/auth/callback"
    )
    
    for i in "${!required_vars[@]}"; do
        var="${required_vars[$i]}"
        default_val="${default_values[$i]}"
        
        if [[ "${!var}" == "$default_val" ]]; then
            using_defaults+=("$var")
            echo -e "${YELLOW}⚠️  $var is using default value: ${!var}${NC}"
        else
            echo -e "${GREEN}✅ $var is set: ${!var}${NC}"
        fi
    done
    
    echo ""
    if [[ ${#using_defaults[@]} -eq 0 ]]; then
        echo -e "${GREEN}🎉 All environment variables are properly configured!${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️  Using default values for: ${using_defaults[*]}${NC}"
        echo ""
        echo "For production use, set these environment variables:"
        echo "export ST_TENANT_ID=your_tenant_id"
        echo "export ST_CLIENT_ID=your_client_id"
        echo "export ST_CLIENT_SECRET=your_client_secret"
        echo "export ST_BASE_URL=your_servicetitan_base_url"
        echo "export PODIUM_API_KEY=your_api_key"
        echo "export PODIUM_LOCATION_ID=your_location_id"
        echo "export PODIUM_CLIENT_ID=your_podium_client_id"
        echo "export PODIUM_CLIENT_SECRET=your_podium_client_secret"
        echo "export PODIUM_REFRESH_TOKEN=your_podium_refresh_token"
        echo "export PODIUM_REDIRECT_URI=your_podium_redirect_uri"
        return 0
    fi
}

# Run quick test
run_quick_test() {
    echo -e "${BLUE}🧪 Running quick test...${NC}"
    echo ""
    
    # Set test environment variables
    export DRY_RUN=true
    export JOB_TYPE_FILTER="test-consultation"
    export NODE_ENV="test"
    
    # Set default environment variables if not already set
    export ST_TENANT_ID=${ST_TENANT_ID:-"12345"}
    export ST_CLIENT_ID=${ST_CLIENT_ID:-"test-client-id"}
    export ST_CLIENT_SECRET=${ST_CLIENT_SECRET:-"test-client-secret"}
    export ST_BASE_URL=${ST_BASE_URL:-"https://api.servicetitan.com"}
    export PODIUM_API_KEY=${PODIUM_API_KEY:-"test-api-key"}
    export PODIUM_LOCATION_ID=${PODIUM_LOCATION_ID:-"test-location-id"}
    export PODIUM_CLIENT_ID=${PODIUM_CLIENT_ID:-"test-client-id"}
    export PODIUM_CLIENT_SECRET=${PODIUM_CLIENT_SECRET:-"test-client-secret"}
    export PODIUM_REFRESH_TOKEN=${PODIUM_REFRESH_TOKEN:-"test-refresh-token"}
    export PODIUM_REDIRECT_URI=${PODIUM_REDIRECT_URI:-"http://localhost:3000/auth/callback"}
    
    echo -e "${YELLOW}Test Configuration:${NC}"
    echo "  DRY_RUN: $DRY_RUN"
    echo "  JOB_TYPE_FILTER: $JOB_TYPE_FILTER"
    echo "  NODE_ENV: $NODE_ENV"
    echo ""
    
    # Run the test
    cd "$TASK_DIR"
    if npx tsx index.ts; then
        echo -e "${GREEN}✅ Quick test completed successfully!${NC}"
    else
        echo -e "${RED}❌ Quick test failed!${NC}"
        return 1
    fi
}

# Run the main task
run_task() {
    echo -e "${BLUE}🚀 Starting booking notification task...${NC}"
    echo ""
    
    # Set environment variables
    export DRY_RUN="$DRY_RUN"
    export JOB_TYPE_FILTER="$JOB_TYPE_FILTER"
    export NODE_ENV="$NODE_ENV"
    
    # Set default environment variables if not already set
    export ST_TENANT_ID=${ST_TENANT_ID:-"12345"}
    export ST_CLIENT_ID=${ST_CLIENT_ID:-"test-client-id"}
    export ST_CLIENT_SECRET=${ST_CLIENT_SECRET:-"test-client-secret"}
    export ST_BASE_URL=${ST_BASE_URL:-"https://api.servicetitan.com"}
    export PODIUM_API_KEY=${PODIUM_API_KEY:-"test-api-key"}
    export PODIUM_LOCATION_ID=${PODIUM_LOCATION_ID:-"test-location-id"}
    export PODIUM_CLIENT_ID=${PODIUM_CLIENT_ID:-"test-client-id"}
    export PODIUM_CLIENT_SECRET=${PODIUM_CLIENT_SECRET:-"test-client-secret"}
    export PODIUM_REFRESH_TOKEN=${PODIUM_REFRESH_TOKEN:-"test-refresh-token"}
    export PODIUM_REDIRECT_URI=${PODIUM_REDIRECT_URI:-"http://localhost:3000/auth/callback"}
    
    echo -e "${YELLOW}Configuration:${NC}"
    echo "  DRY_RUN: $DRY_RUN"
    echo "  JOB_TYPE_FILTER: $JOB_TYPE_FILTER"
    echo "  NODE_ENV: $NODE_ENV"
    echo "  VERBOSE: $VERBOSE"
    echo ""
    
    if [[ "$VERBOSE" == "true" ]]; then
        echo -e "${YELLOW}Environment check:${NC}"
        check_environment
        echo ""
    fi
    
    # Run the task
    cd "$TASK_DIR"
    echo -e "${BLUE}Executing task...${NC}"
    echo ""
    
    if npx tsx index.ts; then
        echo -e "${GREEN}✅ Task completed successfully!${NC}"
    else
        echo -e "${RED}❌ Task failed!${NC}"
        return 1
    fi
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            show_help
            exit 0
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -p|--production)
            DRY_RUN=false
            NODE_ENV="production"
            shift
            ;;
        -b|--job-type-filter)
            JOB_TYPE_FILTER="$2"
            shift 2
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -c|--check-env)
            check_environment
            exit $?
            ;;
        -t|--test)
            run_quick_test
            exit $?
            ;;
        *)
            echo -e "${RED}❌ Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Safety check for production mode
if [[ "$DRY_RUN" == "false" ]]; then
    echo -e "${YELLOW}⚠️  WARNING: Running in PRODUCTION mode!${NC}"
    echo "This will send actual SMS messages to customers."
    echo ""
    
    # Check if using default values
    if [[ "$ST_TENANT_ID" == "12345" || "$ST_CLIENT_ID" == "test-client-id" || "$PODIUM_API_KEY" == "test-api-key" ]]; then
        echo -e "${RED}❌ ERROR: Cannot run in production mode with default/test values!${NC}"
        echo "Please set proper environment variables before running in production."
        echo ""
        echo "Run this to check your environment:"
        echo "  $0 --check-env"
        exit 1
    fi
    
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Operation cancelled.${NC}"
        exit 0
    fi
fi

# Run the task
run_task 