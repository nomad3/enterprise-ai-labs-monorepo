{{/*
Standard Helm chart labels, names, etc.
*/}}

{{/*
Expand the name of the chart.
Usage: {{ include "agentforge.name" (dict "Chart" .Chart "Values" .Values) }}
*/}}
{{- define "agentforge.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
Usage: {{ include "agentforge.fullname" (dict "Chart" .Chart "Release" .Release "Values" .Values) }}
*/}}
{{- define "agentforge.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
Usage: {{ include "agentforge.chart" . }}
*/}}
{{- define "agentforge.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Common labels for all resources within the chart.
Usage: {{- include "agentforge.labels.standard" . | nindent 4 }} (expects top-level .)
*/}}
{{- define "agentforge.labels.standard" -}}
helm.sh/chart: {{ include "agentforge.chart" . }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/part-of: {{ include "agentforge.name" . }}
{{- end -}}

{{/*
Selector labels for a component.
Takes a context dict with .Release, .Chart, .Values, .componentName
Usage: {{- include "agentforge.labels.selector" (dict "Release" .Release "Chart" .Chart "Values" .Values "componentName" "my-component") | nindent 4 }}
*/}}
{{- define "agentforge.labels.selector" -}}
app.kubernetes.io/name: {{ printf "%s-%s" (include "agentforge.name" (dict "Chart" .Chart "Values" .Values)) .componentName | trunc 63 | trimSuffix "-" }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}

{{/*
Labels for a specific component, including standard labels and selector labels.
Takes a context dict with .Release, .Chart, .Values, .componentName
Usage: {{- include "agentforge.labels.component" (dict "Release" .Release "Chart" .Chart "Values" .Values "componentName" "my-component") | nindent 4 }}
*/}}
{{- define "agentforge.labels.component" -}}
{{ include "agentforge.labels.standard" (dict "Chart" .Chart "Release" .Release "Values" .Values) }}
{{ include "agentforge.labels.selector" . }}
{{- end -}}

{{/*
Create a fully qualified name for a component.
Takes a component name as context string.
Usage: {{ include "agentforge.component.fullname" (dict "Release" .Release "Chart" .Chart "Values" .Values "componentName" "my-component") }}
*/}}
{{- define "agentforge.component.fullname" -}}
{{- $compFullName := printf "%s-%s" (include "agentforge.fullname" .) .componentName -}}
{{- $compFullName | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Define a common application deployment structure.
Required context:
  .Chart, .Release, .Values (top level, or from subchart's perspective)
  .componentName (string)
  .componentValues (dict, e.g., .Values.agentforgeApi or .Values.agentforgeUi)
*/}}
{{- define "agentforge.component.deployment" -}}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "agentforge.component.fullname" (dict "Release" .Release "Chart" .Chart "Values" .Values "componentName" .componentName) }}
  labels:
    {{- include "agentforge.labels.component" (dict "Release" .Release "Chart" .Chart "Values" .Values "componentName" .componentName) | nindent 4 }}
spec:
  {{- if not .componentValues.autoscaling.enabled }}
  replicas: {{ .componentValues.replicaCount }}
  {{- end }}
  selector:
    matchLabels:
      {{- include "agentforge.labels.selector" (dict "Release" .Release "Chart" .Chart "Values" .Values "componentName" .componentName) | nindent 6 }}
  template:
    metadata:
      {{- with .componentValues.podAnnotations }}
      annotations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      labels:
        {{- include "agentforge.labels.component" (dict "Release" .Release "Chart" .Chart "Values" .Values "componentName" .componentName) | nindent 8 }}
    spec:
      {{- with .componentValues.imagePullSecrets }}
      imagePullSecrets:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      serviceAccountName: {{ include "agentforge.component.serviceAccountName" (dict "Release" .Release "Chart" .Chart "Values" .Values "componentName" .componentName "componentValues" .componentValues) }}
      securityContext:
        {{- toYaml .componentValues.podSecurityContext | nindent 8 }}
      containers:
        - name: {{ .componentName }}
          securityContext:
            {{- toYaml .componentValues.securityContext | nindent 12 }}
          image: "{{ .componentValues.image.repository }}:{{ .componentValues.image.tag }}"
          imagePullPolicy: {{ .componentValues.image.pullPolicy }}
          ports:
            - name: http
              containerPort: {{ .componentValues.service.targetPort }}
              protocol: TCP
          {{- if .componentValues.env }}
          env:
            {{- range $key, $value := .componentValues.env }}
            - name: {{ $key }}
              value: {{ tpl $value $ | quote }}
            {{- end }}
          {{- end }}
          {{- if .componentValues.livenessProbe.enabled }}
          livenessProbe:
            httpGet:
              path: {{ .componentValues.livenessProbe.path }}
              port: http
            initialDelaySeconds: {{ .componentValues.livenessProbe.initialDelaySeconds }}
            periodSeconds: {{ .componentValues.livenessProbe.periodSeconds }}
          {{- end }}
          {{- if .componentValues.readinessProbe.enabled }}
          readinessProbe:
            httpGet:
              path: {{ .componentValues.readinessProbe.path }}
              port: http
            initialDelaySeconds: {{ .componentValues.readinessProbe.initialDelaySeconds }}
            periodSeconds: {{ .componentValues.readinessProbe.periodSeconds }}
          {{- end }}
          resources:
            {{- toYaml .componentValues.resources | nindent 12 }}
        {{- if .componentValues.sidecars }}
        {{- toYaml .componentValues.sidecars | nindent 8 }}
        {{- end }}
      {{- with .componentValues.nodeSelector }}
      nodeSelector:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .componentValues.affinity }}
      affinity:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .componentValues.tolerations }}
      tolerations:
        {{- toYaml . | nindent 8 }}
      {{- end }}
{{- end -}}

{{/*
Determine the service account name for a component.
*/}}
{{- define "agentforge.component.serviceAccountName" -}}
{{- if .componentValues.serviceAccount.create -}}
{{- include "agentforge.component.fullname" . -}}
{{- else -}}
{{- .componentValues.serviceAccount.name | default (include "agentforge.component.fullname" .) -}}
{{- end -}}
{{- end -}}

{{/*
Define a common application service structure.
Required context:
  .Chart, .Release, .Values
  .componentName (string)
  .componentValues (dict, e.g., .Values.agentforgeApi or .Values.agentforgeUi)
*/}}
{{- define "agentforge.component.service" -}}
apiVersion: v1
kind: Service
metadata:
  name: {{ include "agentforge.component.fullname" (dict "Release" .Release "Chart" .Chart "Values" .Values "componentName" .componentName) }}
  labels:
    {{- include "agentforge.labels.component" (dict "Release" .Release "Chart" .Chart "Values" .Values "componentName" .componentName) | nindent 4 }}
  {{- with .componentValues.service.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
spec:
  type: {{ .componentValues.service.type }}
  ports:
    - port: {{ .componentValues.service.port }}
      targetPort: http
      protocol: TCP
      name: http
  selector:
    {{- include "agentforge.labels.selector" (dict "Release" .Release "Chart" .Chart "Values" .Values "componentName" .componentName) | nindent 4 }}
{{- end -}}

{{/*
Define a common application ingress structure.
Required context:
  .Chart, .Release, .Values
  .componentName (string)
  .componentValues (dict, e.g., .Values.agentforgeApi or .Values.agentforgeUi)
*/}}
{{- define "agentforge.component.ingress" -}}
{{- if .componentValues.ingress.enabled -}}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ include "agentforge.component.fullname" (dict "Release" .Release "Chart" .Chart "Values" .Values "componentName" .componentName) }}
  labels:
    {{- include "agentforge.labels.component" (dict "Release" .Release "Chart" .Chart "Values" .Values "componentName" .componentName) | nindent 4 }}
  {{- with .componentValues.ingress.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
spec:
  {{- if .componentValues.ingress.className }}
  ingressClassName: {{ .componentValues.ingress.className }}
  {{- end }}
  {{- if .componentValues.ingress.tls }}
  tls:
    {{- range .componentValues.ingress.tls }}
    - hosts:
        {{- range .hosts }}
        - {{ . | quote }}
        {{- end }}
      secretName: {{ .secretName }}
    {{- end }}
  {{- end }}
  rules:
    {{- range .componentValues.ingress.hosts }}
    - host: {{ .host | quote }}
      http:
        paths:
          {{- range .paths }}
          - path: {{ .path }}
            pathType: {{ .pathType }}
            {{- if .backend }}
            backend:
              service:
                name: {{ .backend.service.name | default (include "agentforge.component.fullname" (dict "Release" $.Release "Chart" $.Chart "Values" $.Values "componentName" $.componentName)) }}
                port:
                  name: {{ .backend.service.port.name | default "http" }}
            {{- else }}
            backend:
              service:
                name: {{ include "agentforge.component.fullname" (dict "Release" $.Release "Chart" $.Chart "Values" $.Values "componentName" $.componentName) }}
                port:
                  name: "http"
            {{- end }}
          {{- end }}
    {{- end }}
{{- end }}
{{- end -}}
